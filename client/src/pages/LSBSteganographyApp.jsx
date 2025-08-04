import {
	Eye,
	EyeOff,
	FileText,
	Image as ImageIcon,
	Play,
	Upload,
} from "lucide-react";
import React, { useRef, useState } from "react";
import Swal from "sweetalert2";

const LSBSteganographyApp = () => {
	const [selectedImage, setSelectedImage] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null);
	const [encodedImage, setEncodedImage] = useState(null);
	const [decodedData, setDecodedData] = useState(null);
	const [activeTab, setActiveTab] = useState("encode");
	const [isProcessing, setIsProcessing] = useState(false);
	const [stegoImage, setStegoImage] = useState(null);
	const [previewImage, setPreviewImage] = useState(null);

	const imageInputRef = useRef(null);
	const fileInputRef = useRef(null);
	const stegoInputRef = useRef(null);

	// Xử lý chọn ảnh
	const handleImageSelect = async (e) => {
		const file = e.target.files[0];
		if (file) {
			const imageToBase64 = await toBase64(file);
			setPreviewImage(imageToBase64);
			setSelectedImage(file);
		}
	};

	// Xử lý chọn file
	const handleFileSelect = (e) => {
		const file = e.target.files[0];
		if (file) {
			setSelectedFile(file);
		}
	};

	// Xử lý chọn ảnh steganography
	const handleStegoImageSelect = (e) => {
		const file = e.target.files[0];
		if (file) {
			setStegoImage(file);
		}
	};

	const handleEncode = async () => {
		if (!selectedImage || !selectedFile) {
			alert("Vui lòng chọn ảnh và file cần giấu");
			return;
		}

		setIsProcessing(true);

		try {
			// Gửi 2 file lên server (ảnh + file cần giấu)
			const formData = new FormData();
			formData.append("image", selectedImage);
			formData.append("file", selectedFile);

			const response = await fetch(`${import.meta.env.VITE_API_URI}/encode`, {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Lỗi từ server");
			}

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			setEncodedImage(url);

			// Tải về tự động
			const link = document.createElement("a");
			link.href = url;
			link.download = `encoded_${selectedImage.name}`;
			link.click();
			URL.revokeObjectURL(url);

			Swal.fire({
				icon: "success",
				title: "Mã hóa thành công!",
				text: "Ảnh đã được tải xuống với dữ liệu ẩn bên trong.",
			});
		} catch (err) {
			alert("Lỗi khi mã hóa: " + err.message);
		}

		setIsProcessing(false);
	};

	const handleDecode = async () => {
		if (!stegoImage) {
			alert("Vui lòng chọn ảnh cần giải mã");
			return;
		}

		setIsProcessing(true);

		try {
			const formData = new FormData();
			formData.append("image", stegoImage);

			const response = await fetch(`${import.meta.env.VITE_API_URI}/decode`, {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Lỗi khi giải mã");
			}

			const blob = await response.blob();
			const contentDisposition = response.headers.get(
				"Content-Disposition"
			);

			// Lấy tên file từ header hoặc tự tạo
			let fileName = "decoded_file";
			if (contentDisposition) {
				const fileNameMatch = contentDisposition.match(
					/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
				);
				if (fileNameMatch) {
					fileName = fileNameMatch[1].replace(/['"]/g, "");
				}
			}

			const url = URL.createObjectURL(blob);

			setDecodedData({
				fileName: fileName,
				size: blob.size,
				blobUrl: url,
			});
		} catch (err) {
			alert("Lỗi khi giải mã: " + err.message);
		}
		Swal.fire({
			icon: "success",
			title: "Giải mã thành công!",
			text: "Dữ liệu đã được giải mã thành công.",
		});
		setIsProcessing(false);
	};

	const toBase64 = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = (error) => reject(error);
			reader.onabort = () => reject(new Error("File reading aborted"));
		});
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
			<div className="max-w-6xl mx-auto">
				<div className="bg-white rounded-xl shadow-lg p-6 mb-6">
					<h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
						LSB Steganography Tool
					</h1>
					<p className="text-center text-gray-600 mb-6">
						Giấu tin trong ảnh sử dụng thuật toán Least Significant
						Bit
					</p>

					{/* Tab Navigation */}
					<div className="flex justify-center mb-6">
						<div className="bg-gray-100 rounded-lg p-1 inline-flex">
							<button
								onClick={() => setActiveTab("encode")}
								className={`px-6 py-2 cursor-pointer rounded-md font-medium transition-colors ${
									activeTab === "encode"
										? "bg-blue-500 text-white shadow-md"
										: "text-gray-600 hover:text-gray-800"
								}`}>
								<Eye className="w-4 h-4 inline mr-2" />
								Mã hóa
							</button>
							<button
								onClick={() => setActiveTab("decode")}
								className={`px-6 py-2 cursor-pointer rounded-md font-medium transition-colors ${
									activeTab === "decode"
										? "bg-purple-500 text-white shadow-md"
										: "text-gray-600 hover:text-gray-800"
								}`}>
								<EyeOff className="w-4 h-4 inline mr-2" />
								Giải mã
							</button>
						</div>
					</div>

					{/* Encode Tab */}
					{activeTab === "encode" && (
						<div className="space-y-6">
							<div className="grid md:grid-cols-2 gap-6">
								{/* Image Selection */}
								<div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
									<h3 className="text-lg font-semibold mb-4 flex items-center">
										<ImageIcon className="w-5 h-5 mr-2" />
										Chọn ảnh để giấu tin
									</h3>
									<input
										type="file"
										accept="image/*"
										ref={imageInputRef}
										onChange={handleImageSelect}
										className="hidden"
									/>
									<button
										onClick={() =>
											imageInputRef.current.click()
										}
										className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center cursor-pointer">
										<Upload className="w-5 h-5 mr-2" />
										Chọn ảnh
									</button>
									{selectedImage && (
										<div className="mt-4">
											<p className="text-sm text-gray-600 mb-2">
												Đã chọn: {selectedImage.name}
											</p>
											{previewImage && (
												<img
													src={previewImage}
													alt="Preview"
													className="max-w-full max-h-full rounded-lg border"
												/>
											)}
										</div>
									)}
								</div>

								{/* File Selection */}
								<div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
									<h3 className="text-lg font-semibold mb-4 flex items-center">
										<FileText className="w-5 h-5 mr-2" />
										Chọn file cần giấu
									</h3>
									<input
										type="file"
										ref={fileInputRef}
										onChange={handleFileSelect}
										className="hidden"
									/>
									<button
										onClick={() =>
											fileInputRef.current.click()
										}
										className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center cursor-pointer">
										<Upload className="w-5 h-5 mr-2" />
										Chọn file
									</button>
									{selectedFile && (
										<div className="mt-4 p-3 bg-white rounded border">
											<p className="text-sm text-gray-600">
												<strong>Tên file:</strong>{" "}
												{selectedFile.name}
											</p>
											<p className="text-sm text-gray-600">
												<strong>Kích thước:</strong>{" "}
												{formatFileSize(
													selectedFile.size
												)}
											</p>
										</div>
									)}
								</div>
							</div>

							{/* Start Encode Button */}
							<div className="text-center">
								<button
									onClick={handleEncode}
									disabled={
										!selectedImage ||
										!selectedFile ||
										isProcessing
									}
									className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-8 rounded-lg font-semibold text-lg transition-all flex items-center justify-center mx-auto cursor-pointer">
									{isProcessing ? (
										<>
											<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
											Đang xử lý...
										</>
									) : (
										<>
											<Play className="w-5 h-5 mr-2" />
											BẮT ĐẦU MÃ HÓA
										</>
									)}
								</button>
							</div>

							{/* Encoded Image Display */}
							{encodedImage && (
								<div className="bg-green-50 rounded-lg p-6 border border-green-200">
									<h3 className="text-lg font-semibold text-green-800 mb-4">
										Ảnh đã được mã hóa thành công!
									</h3>
									<div className="text-center">
										<p className="text-sm text-green-600">
											Ảnh đã được tự động tải xuống với dữ
											liệu ẩn bên trong
										</p>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Decode Tab */}
					{activeTab === "decode" && (
						<div className="space-y-6">
							<div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
								<h3 className="text-lg font-semibold mb-4 flex items-center">
									<ImageIcon className="w-5 h-5 mr-2" />
									Chọn ảnh cần giải mã
								</h3>
								<input
									type="file"
									accept="image/*"
									ref={stegoInputRef}
									onChange={handleStegoImageSelect}
									className="hidden"
								/>
								<button
									onClick={() =>
										stegoInputRef.current.click()
									}
									className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center cursor-pointer">
									<Upload className="w-5 h-5 mr-2" />
									Chọn ảnh steganography
								</button>
								{stegoImage && (
									<p className="mt-2 text-sm text-gray-600">
										Đã chọn: {stegoImage.name}
										<br />
										Kích thước: {formatFileSize(stegoImage.size)}
										<br />
										{stegoImage.type.startsWith("image/")
											? "Định dạng: " + stegoImage.type
											: "Định dạng không hợp lệ"}
										<br />
										<img src={URL.createObjectURL(stegoImage)} alt="" className="mt-2 w-1/2 h-auto" />
									</p>
								)}
							</div>

							{/* Decode Button */}
							<div className="text-center">
								<button
									onClick={handleDecode}
									disabled={!stegoImage || isProcessing}
									className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-8 rounded-lg font-semibold text-lg transition-all flex items-center justify-center mx-auto cursor-pointer">
									{isProcessing ? (
										<>
											<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
											Đang giải mã...
										</>
									) : (
										<>
											<EyeOff className="w-5 h-5 mr-2" />
											BẮT ĐẦU GIẢI MÃ
										</>
									)}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default LSBSteganographyApp;
