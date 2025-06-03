# ImageCompress Pro 🖼️

A powerful, free online image compressor that reduces file sizes by up to 90% while maintaining excellent quality. Built with vanilla JavaScript for fast, secure, client-side compression.

![ImageCompress Pro](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)

## ✨ Features

- **🔒 100% Secure**: All processing happens in your browser - no files uploaded to servers
- **⚡ Lightning Fast**: Advanced compression algorithms for quick processing
- **📱 Mobile Friendly**: Fully responsive design that works on all devices
- **🎯 Smart Compression**: Dual compression modes - quality-based and size-based
- **📦 Multiple Download Options**: Individual downloads, batch download, or ZIP archive
- **🖼️ Interactive Preview**: Before/after slider comparison for visual quality assessment
- **🔄 Format Conversion**: Support for JPEG, PNG, WebP formats with smart auto-conversion
- **📊 Detailed Analytics**: Real-time compression statistics and file size comparisons

## 🚀 Demo

![Demo Screenshot](demo-screenshot.png)

## 📋 Supported Formats

- **Input**: JPEG, PNG, WebP, GIF
- **Output**: JPEG, PNG, WebP (with format conversion options)
- **Maximum file size**: 50MB per image

## 🛠️ Installation

### Option 1: Direct Download

1. Clone this repository:

```bash
git clone https://github.com/yourusername/image-compressor.git
cd image-compressor
```

2. Open `index.html` in your web browser

### Option 2: Local Server (Recommended)

```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## 💡 Usage

### Quality-Based Compression

1. Select "Quality-based" compression method
2. Adjust the quality slider (10-100%)
3. Choose output format (Keep Original, JPEG, PNG, WebP)
4. Upload your images
5. Click "Compress Images"

### Size-Based Compression

1. Select "Size-based" compression method
2. Enter target file size in KB
3. Choose output format
4. Upload your images
5. Click "Compress Images"

### Download Options

- **Individual Download**: Click download button on each compressed image
- **Download All**: Downloads all images individually with delays
- **Download as ZIP**: Creates a single ZIP file containing all compressed images

## 🔧 Technical Details

### Compression Algorithms

- **JPEG**: Aggressive quality optimization with smart dimension scaling
- **PNG**: Multiple compression strategies including color depth reduction and dimension scaling
- **WebP**: Advanced compression with quality optimization
- **Auto-conversion**: Smart PNG-to-JPEG conversion for better compression when beneficial

### Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Dependencies

- [JSZip](https://stuhome.github.io/JSZip/) for ZIP file creation
- [Font Awesome](https://fontawesome.com/) for icons
- [Google Fonts (Poppins)](https://fonts.google.com/) for typography

## 📁 Project Structure

```
image-compressor/
├── index.html          # Main HTML file
├── styles.css          # Complete styling and responsive design
├── script.js           # Core compression logic and UI functionality
├── README.md           # This file
└── .gitignore         # Git ignore file
```

## 🎨 Features Overview

### Compression Methods

- **Quality-based**: Control compression quality with slider (10-100%)
- **Size-based**: Specify target file size in KB

### Smart Compression

- Automatic dimension optimization for web use
- Intelligent format conversion when beneficial
- Fallback strategies for optimal results

### User Experience

- Drag-and-drop file upload
- Real-time image previews
- Interactive before/after comparison slider
- Progress tracking with visual feedback
- Responsive design for all screen sizes

## 🔮 Future Enhancements

- [ ] WebP to AVIF conversion support
- [ ] Batch processing progress indicators
- [ ] Custom dimension resizing options
- [ ] Compression history and presets
- [ ] PWA (Progressive Web App) support
- [ ] Dark mode theme

## 🐛 Known Issues

- Very large PNG files (>10MB) may take longer to process
- Mobile browsers may have memory limitations with very large images
- Safari may have limited WebP support on older versions

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [JSZip](https://stuhome.github.io/JSZip/) for ZIP file generation
- [Font Awesome](https://fontawesome.com/) for beautiful icons
- [Google Fonts](https://fonts.google.com/) for typography
- Canvas API for image processing capabilities

## 📊 Performance

- **Average compression**: 70-85% file size reduction
- **Processing speed**: 1-3 seconds per image (varies by size and device)
- **Memory usage**: Optimized with automatic cleanup
- **Batch processing**: Supports up to 50 images simultaneously

## 💻 Browser Performance Tips

- For best performance, use Chrome or Firefox
- Close other tabs when processing large images
- Allow JavaScript to run for compression algorithms
- Ensure sufficient device memory for large batch processing

---

Made with ❤️ for the web community. Compress smart, save space! 🚀
