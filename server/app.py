# --- app.py ---
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import cv2
import json
from PIL import Image

app = Flask(__name__)
CORS(app)


# ----------------- LSB Steganography Class -----------------
class LSBSteg:
    def __init__(self, image):
        self.image = image.copy()
        self.shape = self.image.shape

    def encode_binary(self, data: bytes):
        binary_data = "".join([format(byte, "08b") for byte in data])
        data_len = len(binary_data)

        if data_len + 32 > self.image.size:
            raise ValueError("Dữ liệu quá lớn để giấu trong ảnh này.")

        binary_len = format(data_len, "032b")
        binary_data = binary_len + binary_data

        flat_image = self.image.flatten()
        for i in range(len(binary_data)):
            flat_image[i] = (flat_image[i] & ~1) | int(binary_data[i])

        return flat_image.reshape(self.shape)

    def decode_binary(self):
        flat_image = self.image.flatten()
        binary_len = "".join([str(flat_image[i] & 1) for i in range(32)])
        data_len = int(binary_len, 2)

        binary_data = "".join(
            [str(flat_image[i] & 1) for i in range(32, 32 + data_len)]
        )
        byte_data = [binary_data[i : i + 8] for i in range(0, len(binary_data), 8)]
        return bytes([int(b, 2) for b in byte_data])


def create_payload(filename, file_data):
    """Tạo payload chứa metadata và dữ liệu file"""
    metadata = {"filename": filename, "size": len(file_data)}

    # Chuyển metadata thành JSON string rồi encode thành bytes
    metadata_json = json.dumps(metadata).encode("utf-8")
    metadata_size = len(metadata_json)

    # Cấu trúc: [4 bytes metadata_size][metadata][file_data]
    payload = metadata_size.to_bytes(4, byteorder="big") + metadata_json + file_data
    return payload


def extract_payload(payload_data):
    """Trích xuất metadata và dữ liệu file từ payload"""
    # Đọc 4 bytes đầu để biết kích thước metadata
    metadata_size = int.from_bytes(payload_data[:4], byteorder="big")

    # Trích xuất metadata
    metadata_json = payload_data[4 : 4 + metadata_size].decode("utf-8")
    metadata = json.loads(metadata_json)

    # Trích xuất dữ liệu file
    file_data = payload_data[4 + metadata_size :]

    return metadata, file_data


# ----------------- API Routes -----------------
@app.route("/lsb/encode", methods=["POST"])
def lsb_encode():
    image = request.files.get("image")
    file = request.files.get("file")

    if not image or not file:
        return jsonify({"error": "Missing image or file"}), 400

    image_path = "temp_input.png"
    file_path = "temp_file.bin"
    output_path = "encoded_output.png"

    image.save(image_path)
    file.save(file_path)

    # Convert to PNG
    img = Image.open(image_path).convert("RGB")
    img.save(image_path, "PNG")

    image_cv = cv2.imread(image_path)

    # Đọc file và tạo payload với metadata
    with open(file_path, "rb") as f:
        file_data = f.read()

    # Tạo payload chứa tên file gốc và dữ liệu
    payload = create_payload(file.filename, file_data)

    try:
        steg = LSBSteg(image_cv)
        encoded_image = steg.encode_binary(payload)
        cv2.imwrite(output_path, encoded_image)

        # Cleanup temp files
        os.remove(image_path)
        os.remove(file_path)

        return send_file(output_path, mimetype="image/png", as_attachment=True)
    except Exception as e:
        return jsonify({"error": f"Encoding failed: {str(e)}"}), 500


@app.route("/lsb/decode", methods=["POST"])
def lsb_decode():
    image = request.files.get("image")

    if not image:
        return jsonify({"error": "Missing image"}), 400

    image_path = "temp_encoded.png"
    image.save(image_path)

    try:
        image_cv = cv2.imread(image_path)
        steg = LSBSteg(image_cv)

        # Giải mã payload
        payload_data = steg.decode_binary()

        # Trích xuất metadata và dữ liệu file
        metadata, file_data = extract_payload(payload_data)

        # Sử dụng tên file gốc
        original_filename = metadata["filename"]
        decoded_path = f"D:/decoded_{original_filename}"

        # Lưu file với tên và phần mở rộng gốc
        with open(decoded_path, "wb") as f:
            f.write(file_data)

        # Cleanup temp files
        os.remove(image_path)

        return send_file(
            decoded_path,
            as_attachment=True,
            download_name=original_filename,
            mimetype="application/octet-stream",
        )

    except Exception as e:
        return jsonify({"error": f"Decoding failed: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)
