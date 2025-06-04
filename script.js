// Image Compressor Pro - Main JavaScript File

class ImageCompressor {
  constructor() {
    this.selectedFiles = [];
    this.compressedFiles = [];
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    this.supportedFormats = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    this.initializeElements();
    this.attachEventListeners();
    this.initializeNavigation();
    this.initializeDemoSlider();
  }

  initializeElements() {
    // Core elements
    this.uploadArea = document.getElementById("uploadArea");
    this.fileInput = document.getElementById("fileInput");
    this.qualitySlider = document.getElementById("quality");
    this.qualityValue = document.getElementById("qualityValue");
    this.maxFileSizeInput = document.getElementById("maxFileSize");
    this.formatSelect = document.getElementById("format");
    this.compressBtn = document.getElementById("compressBtn");
    this.resultsSection = document.getElementById("resultsSection");
    this.resultsGrid = document.getElementById("resultsGrid");
    this.downloadAllBtn = document.getElementById("downloadAllBtn");
    this.downloadZipBtn = document.getElementById("downloadZipBtn");
    this.progressModal = document.getElementById("progressModal");
    this.progressFill = document.getElementById("progressFill");
    this.progressText = document.getElementById("progressText");

    // Compression method elements
    this.compressionMethodRadios = document.querySelectorAll(
      'input[name="compressionMethod"]'
    );
    this.qualityGroup = document.getElementById("qualityGroup");
    this.sizeGroup = document.getElementById("sizeGroup");

    // Preview elements
    this.selectedImages = document.getElementById("selectedImages");
    this.imagePreviewGrid = document.getElementById("imagePreviewGrid");

    // Navigation elements
    this.hamburger = document.querySelector(".hamburger");
    this.navMenu = document.querySelector(".nav-menu");
  }

  attachEventListeners() {
    // File upload events
    this.uploadArea.addEventListener("click", () => this.fileInput.click());
    this.fileInput.addEventListener("change", (e) => this.handleFileSelect(e));

    // Drag and drop events
    this.uploadArea.addEventListener("dragover", (e) => this.handleDragOver(e));
    this.uploadArea.addEventListener("dragleave", (e) =>
      this.handleDragLeave(e)
    );
    this.uploadArea.addEventListener("drop", (e) => this.handleDrop(e));

    // Quality slider
    this.qualitySlider.addEventListener("input", (e) =>
      this.updateQualityValue(e)
    );

    // Compression method radio buttons
    this.compressionMethodRadios.forEach((radio) => {
      radio.addEventListener("change", (e) =>
        this.handleCompressionMethodChange(e)
      );
    });

    // Compress button
    this.compressBtn.addEventListener("click", () => this.compressImages());

    // Download all button
    this.downloadAllBtn.addEventListener("click", () =>
      this.downloadAllImages()
    );

    // Download ZIP button
    this.downloadZipBtn.addEventListener("click", () => this.downloadAsZip());

    // Browse files link
    document
      .querySelector(".upload-link")
      .addEventListener("click", () => this.fileInput.click());

    // Modal close (click outside)
    this.progressModal.addEventListener("click", (e) => {
      if (e.target === this.progressModal) {
        this.hideProgressModal();
      }
    });

    // Prevent default drag behaviors on document
    document.addEventListener("dragover", (e) => e.preventDefault());
    document.addEventListener("drop", (e) => e.preventDefault());
  }

  initializeNavigation() {
    // Mobile navigation toggle
    this.hamburger.addEventListener("click", () => {
      this.hamburger.classList.toggle("active");
      this.navMenu.classList.toggle("active");

      // Prevent body scroll when menu is open
      if (this.navMenu.classList.contains("active")) {
        document.body.classList.add("menu-open");
      } else {
        document.body.classList.remove("menu-open");
      }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute("href");
        const target = document.querySelector(targetId);

        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          // Close mobile menu if open
          this.navMenu.classList.remove("active");
          this.hamburger.classList.remove("active");
          document.body.classList.remove("menu-open");
        }
      });
    });

    // Additional specific handling for mobile nav-menu links
    const mobileNavLinks = this.navMenu.querySelectorAll(".nav-link");
    mobileNavLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const targetId = link.getAttribute("href");
        const target = document.querySelector(targetId);

        console.log("Mobile nav link clicked:", targetId, target);

        if (target) {
          // Close mobile menu first
          this.navMenu.classList.remove("active");
          this.hamburger.classList.remove("active");
          document.body.classList.remove("menu-open");

          // Then scroll to target
          setTimeout(() => {
            target.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 100);
        }
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        this.navMenu.classList.contains("active") &&
        !this.navMenu.contains(e.target) &&
        !this.hamburger.contains(e.target)
      ) {
        this.navMenu.classList.remove("active");
        this.hamburger.classList.remove("active");
        document.body.classList.remove("menu-open");
      }
    });

    // Close menu on window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        this.navMenu.classList.remove("active");
        this.hamburger.classList.remove("active");
        document.body.classList.remove("menu-open");
      }
    });
  }

  handleDragOver(e) {
    e.preventDefault();
    this.uploadArea.classList.add("dragover");
  }

  handleDragLeave(e) {
    e.preventDefault();
    this.uploadArea.classList.remove("dragover");
  }

  handleDrop(e) {
    e.preventDefault();
    this.uploadArea.classList.remove("dragover");
    const files = Array.from(e.dataTransfer.files);
    this.processFiles(files);
  }

  handleFileSelect(e) {
    const files = Array.from(e.target.files);
    this.processFiles(files);
  }

  processFiles(files) {
    const validFiles = files.filter((file) => this.validateFile(file));

    if (validFiles.length === 0) {
      this.showNotification(
        "No valid image files selected. Please select JPEG, PNG, WebP, or GIF files.",
        "error"
      );
      return;
    }

    // Filter out duplicates based on file name and size
    const newFiles = validFiles.filter((newFile) => {
      return !this.selectedFiles.some(
        (existingFile) =>
          existingFile.name === newFile.name &&
          existingFile.size === newFile.size
      );
    });

    if (newFiles.length === 0) {
      this.showNotification(
        "All selected files are already in the list!",
        "warning"
      );
      return;
    }

    // Add new files to existing selection instead of replacing
    this.selectedFiles = [...this.selectedFiles, ...newFiles];
    this.updateUploadArea();
    this.generateImagePreviews();
    this.compressBtn.disabled = false;

    const totalFiles = this.selectedFiles.length;
    const addedFiles = newFiles.length;

    if (addedFiles === 1) {
      this.showNotification(
        `${addedFiles} new file added! Total: ${totalFiles} file(s)`,
        "success"
      );
    } else {
      this.showNotification(
        `${addedFiles} new files added! Total: ${totalFiles} file(s)`,
        "success"
      );
    }
  }

  validateFile(file) {
    // Check file type
    if (!this.supportedFormats.includes(file.type)) {
      console.warn(`Unsupported file type: ${file.type}`);
      return false;
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      console.warn(
        `File too large: ${file.name} (${this.formatFileSize(file.size)})`
      );
      return false;
    }

    return true;
  }

  updateUploadArea() {
    const uploadContent = this.uploadArea.querySelector(".upload-content");
    uploadContent.innerHTML = `
            <i class="fas fa-check-circle upload-icon" style="color: #10b981;"></i>
            <h3>${this.selectedFiles.length} file(s) selected</h3>
            <p>Click to add more images or drag new ones here</p>
        `;
  }

  generateImagePreviews() {
    this.imagePreviewGrid.innerHTML = "";

    if (this.selectedFiles.length === 0) {
      this.selectedImages.style.display = "none";
      return;
    }

    this.selectedImages.style.display = "block";

    this.selectedFiles.forEach((file, index) => {
      const previewItem = document.createElement("div");
      previewItem.className = "image-preview-item";

      const img = document.createElement("img");
      img.className = "preview-image";
      img.alt = file.name;

      // Create object URL for preview
      const objectURL = URL.createObjectURL(file);
      img.src = objectURL;

      // Handle image load error
      img.onerror = () => {
        img.src =
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==";
      };

      const filename = document.createElement("div");
      filename.className = "preview-filename";
      filename.textContent =
        file.name.length > 15 ? file.name.substring(0, 12) + "..." : file.name;
      filename.title = file.name; // Full name on hover

      const fileSize = document.createElement("div");
      fileSize.className = "preview-size";
      fileSize.textContent = this.formatFileSize(file.size);

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-image";
      removeBtn.innerHTML = "×";
      removeBtn.title = "Remove image";
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        this.removeImage(index);
      };

      previewItem.appendChild(img);
      previewItem.appendChild(filename);
      previewItem.appendChild(fileSize);
      previewItem.appendChild(removeBtn);

      this.imagePreviewGrid.appendChild(previewItem);
    });
  }

  removeImage(index) {
    // Clean up object URL to prevent memory leaks
    const removedFile = this.selectedFiles[index];
    if (removedFile && removedFile.objectURL) {
      URL.revokeObjectURL(removedFile.objectURL);
    }

    // Remove from selectedFiles array
    this.selectedFiles.splice(index, 1);

    // Update UI
    if (this.selectedFiles.length === 0) {
      this.compressBtn.disabled = true;
      this.selectedImages.style.display = "none";

      // Reset upload area
      const uploadContent = this.uploadArea.querySelector(".upload-content");
      uploadContent.innerHTML = `
        <i class="fas fa-cloud-upload-alt upload-icon"></i>
        <h3>Drop your images here</h3>
        <p>or <span class="upload-link">browse files</span></p>
      `;

      // Re-attach browse files listener
      document
        .querySelector(".upload-link")
        .addEventListener("click", () => this.fileInput.click());

      // Clear file input
      this.fileInput.value = "";
    } else {
      this.updateUploadArea();
      this.generateImagePreviews();
    }

    this.showNotification("Image removed successfully!", "success");
  }

  updateQualityValue(e) {
    this.qualityValue.textContent = `${e.target.value}%`;
  }

  handleCompressionMethodChange(e) {
    const selectedMethod = e.target.value;

    if (selectedMethod === "quality") {
      // Show quality group, hide size group
      this.qualityGroup.style.display = "flex";
      this.sizeGroup.style.display = "none";

      // Clear max file size input
      this.maxFileSizeInput.value = "";
    } else if (selectedMethod === "size") {
      // Show size group, hide quality group
      this.qualityGroup.style.display = "none";
      this.sizeGroup.style.display = "flex";

      // Set a default value for max file size if empty
      if (!this.maxFileSizeInput.value) {
        this.maxFileSizeInput.value = "500"; // 500KB default
      }
    }
  }

  async compressImages() {
    if (this.selectedFiles.length === 0) {
      this.showNotification("Please select files first!", "error");
      return;
    }

    this.showProgressModal();
    this.compressedFiles = [];

    // Get compression method
    const compressionMethod = document.querySelector(
      'input[name="compressionMethod"]:checked'
    ).value;

    let quality = 0.8; // default quality
    let maxFileSizeKB = null;

    if (compressionMethod === "quality") {
      quality = this.qualitySlider.value / 100;
    } else if (compressionMethod === "size") {
      maxFileSizeKB = parseInt(this.maxFileSizeInput.value);
      if (!maxFileSizeKB || maxFileSizeKB <= 0) {
        this.hideProgressModal();
        this.showNotification(
          "Please enter a valid target file size!",
          "error"
        );
        return;
      }
      // For size-based compression, start with a reasonable quality
      quality = 0.7;
    }

    const outputFormat = this.formatSelect.value;

    try {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        const file = this.selectedFiles[i];
        this.updateProgress(
          (i / this.selectedFiles.length) * 100,
          `Compressing ${file.name}...`
        );

        const compressedFile = await this.compressImage(
          file,
          quality,
          outputFormat,
          maxFileSizeKB
        );
        this.compressedFiles.push(compressedFile);

        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      this.updateProgress(100, "Compression complete!");

      setTimeout(() => {
        this.hideProgressModal();
        this.displayResults();
      }, 1000);
    } catch (error) {
      console.error("Compression error:", error);
      this.hideProgressModal();
      this.showNotification(
        "An error occurred during compression. Please try again.",
        "error"
      );
    }
  }

  async compressImage(file, quality, outputFormat, maxFileSizeKB) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = async () => {
        // Calculate optimal dimensions for compression
        let { width, height } = this.calculateOptimalDimensions(
          img.width,
          img.height
        );

        // Set canvas dimensions to the optimal size
        canvas.width = width;
        canvas.height = height;

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw image on canvas with optimal dimensions
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output format and compression settings
        let mimeType = file.type;
        let extension = this.getFileExtension(file.name);
        let compressionQuality = quality;

        if (outputFormat !== "original") {
          switch (outputFormat) {
            case "jpeg":
              mimeType = "image/jpeg";
              extension = "jpg";
              compressionQuality = Math.min(quality, 0.8);
              break;
            case "png":
              mimeType = "image/png";
              extension = "png";
              // For PNG with max file size, handle differently
              if (maxFileSizeKB) {
                this.compressPNGWithMaxSize(
                  canvas,
                  file,
                  quality,
                  maxFileSizeKB,
                  resolve
                );
                return;
              } else {
                this.compressPNG(canvas, file, quality, resolve);
                return;
              }
            case "webp":
              mimeType = "image/webp";
              extension = "webp";
              compressionQuality = Math.min(quality, 0.75);
              break;
          }
        } else {
          // For original format, optimize based on file type
          if (file.type === "image/png") {
            // Special handling for PNG files
            if (maxFileSizeKB) {
              this.compressPNGWithMaxSize(
                canvas,
                file,
                quality,
                maxFileSizeKB,
                resolve
              );
              return;
            } else {
              this.compressPNGWithAutoConversion(
                canvas,
                file,
                quality,
                outputFormat,
                resolve
              );
              return;
            }
          } else if (file.type === "image/jpeg") {
            // For JPEG, use aggressive compression
            compressionQuality = Math.min(quality, 0.75);
          }
        }

        // If maxFileSizeKB is specified, use iterative compression
        if (maxFileSizeKB) {
          this.compressToTargetSize(
            canvas,
            file,
            mimeType,
            extension,
            compressionQuality,
            maxFileSizeKB,
            resolve
          );
        } else {
          // Standard compression without size target
          this.performStandardCompression(
            canvas,
            file,
            mimeType,
            extension,
            compressionQuality,
            resolve
          );
        }
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Method for standard compression without size target
  performStandardCompression(
    canvas,
    file,
    mimeType,
    extension,
    compressionQuality,
    resolve
  ) {
    canvas.toBlob(
      (blob) => {
        const originalSize = file.size;
        const compressedSize = blob.size;

        // If compressed size is larger, try more aggressive compression
        if (compressedSize >= originalSize && mimeType === "image/jpeg") {
          canvas.toBlob(
            (newBlob) => {
              const finalSize = newBlob.size;
              const savings = (
                ((originalSize - finalSize) / originalSize) *
                100
              ).toFixed(1);

              const compressedFile = {
                name: this.changeFileExtension(file.name, extension),
                originalName: file.name,
                blob: newBlob,
                originalSize: originalSize,
                compressedSize: finalSize,
                savings: savings,
                url: URL.createObjectURL(newBlob),
              };

              resolve(compressedFile);
            },
            mimeType,
            0.5
          );
        } else {
          const savings = (
            ((originalSize - compressedSize) / originalSize) *
            100
          ).toFixed(1);

          const compressedFile = {
            name: this.changeFileExtension(file.name, extension),
            originalName: file.name,
            blob: blob,
            originalSize: originalSize,
            compressedSize: compressedSize,
            savings: savings,
            url: URL.createObjectURL(blob),
          };

          resolve(compressedFile);
        }
      },
      mimeType,
      compressionQuality
    );
  }

  // Method for iterative compression to reach target file size
  async compressToTargetSize(
    canvas,
    file,
    mimeType,
    extension,
    initialQuality,
    maxFileSizeKB,
    resolve
  ) {
    const targetSizeBytes = maxFileSizeKB * 1024;
    const originalSize = file.size;

    let currentQuality = initialQuality;
    let attempts = 0;
    const maxAttempts = 10;
    let bestResult = null;

    while (attempts < maxAttempts) {
      const blob = await new Promise((blobResolve) => {
        canvas.toBlob(blobResolve, mimeType, currentQuality);
      });

      if (blob.size <= targetSizeBytes || currentQuality <= 0.1) {
        // Target reached or minimum quality reached
        const savings = (
          ((originalSize - blob.size) / originalSize) *
          100
        ).toFixed(1);

        const compressedFile = {
          name: this.changeFileExtension(file.name, extension),
          originalName: file.name,
          blob: blob,
          originalSize: originalSize,
          compressedSize: blob.size,
          savings: savings,
          url: URL.createObjectURL(blob),
          note:
            blob.size <= targetSizeBytes
              ? `Compressed to target size (${maxFileSizeKB} KB)`
              : `Minimum quality reached (${(currentQuality * 100).toFixed(
                  0
                )}%)`,
        };

        resolve(compressedFile);
        return;
      }

      bestResult = blob;
      // Reduce quality for next attempt
      currentQuality *= 0.8;
      attempts++;
    }

    // If we couldn't reach target, return best result
    if (bestResult) {
      const savings = (
        ((originalSize - bestResult.size) / originalSize) *
        100
      ).toFixed(1);

      const compressedFile = {
        name: this.changeFileExtension(file.name, extension),
        originalName: file.name,
        blob: bestResult,
        originalSize: originalSize,
        compressedSize: bestResult.size,
        savings: savings,
        url: URL.createObjectURL(bestResult),
        note: `Best compression achieved (target: ${maxFileSizeKB} KB)`,
      };

      resolve(compressedFile);
    }
  }

  // Special PNG compression method with max file size
  compressPNGWithMaxSize(
    canvas,
    originalFile,
    quality,
    maxFileSizeKB,
    resolve
  ) {
    const targetSizeBytes = maxFileSizeKB * 1024;
    const originalSize = originalFile.size;

    // If original is already smaller than target, just optimize it normally
    if (originalSize <= targetSizeBytes) {
      this.compressPNG(canvas, originalFile, quality, resolve);
      return;
    }

    // Try PNG compression strategies with iterative size reduction
    const tryPNGCompression = async () => {
      // Strategy 1: Try reducing dimensions progressively
      let scale = 1.0;
      let bestResult = null;

      while (scale > 0.3) {
        // Don't go smaller than 30% of original
        const scaledCanvas = document.createElement("canvas");
        const scaledCtx = scaledCanvas.getContext("2d");

        scaledCanvas.width = Math.round(canvas.width * scale);
        scaledCanvas.height = Math.round(canvas.height * scale);

        scaledCtx.imageSmoothingEnabled = true;
        scaledCtx.imageSmoothingQuality = "high";
        scaledCtx.drawImage(
          canvas,
          0,
          0,
          scaledCanvas.width,
          scaledCanvas.height
        );

        const blob = await new Promise((blobResolve) => {
          scaledCtx.canvas.toBlob(blobResolve, "image/png");
        });

        if (blob.size <= targetSizeBytes) {
          const savings = (
            ((originalSize - blob.size) / originalSize) *
            100
          ).toFixed(1);

          const compressedFile = {
            name: originalFile.name,
            originalName: originalFile.name,
            blob: blob,
            originalSize: originalSize,
            compressedSize: blob.size,
            savings: savings,
            url: URL.createObjectURL(blob),
            note: `PNG compressed to ${maxFileSizeKB} KB (${Math.round(
              scale * 100
            )}% scale)`,
          };

          resolve(compressedFile);
          return;
        }

        bestResult = { blob, scale };
        scale -= 0.1; // Reduce by 10% each iteration
      }

      // Strategy 2: If PNG can't reach target and auto-conversion is allowed, try JPEG
      // Check if we should allow auto-conversion (only when output format is "original")
      const outputFormat = document.getElementById("format").value;
      if (outputFormat === "original" && originalSize > 1024 * 1024) {
        // Only for files > 1MB and when format is "Keep Original"
        const jpegBlob = await new Promise((blobResolve) => {
          canvas.toBlob(blobResolve, "image/jpeg", quality * 0.8);
        });

        if (jpegBlob.size <= targetSizeBytes) {
          const savings = (
            ((originalSize - jpegBlob.size) / originalSize) *
            100
          ).toFixed(1);

          const compressedFile = {
            name: this.changeFileExtension(originalFile.name, "jpg"),
            originalName: originalFile.name,
            blob: jpegBlob,
            originalSize: originalSize,
            compressedSize: jpegBlob.size,
            savings: savings,
            url: URL.createObjectURL(jpegBlob),
            note: `Auto-converted to JPEG to reach ${maxFileSizeKB} KB target`,
          };

          resolve(compressedFile);
          return;
        }
      }

      // If no strategy worked, return best PNG result or original
      if (bestResult && bestResult.blob.size < originalSize) {
        const savings = (
          ((originalSize - bestResult.blob.size) / originalSize) *
          100
        ).toFixed(1);

        const compressedFile = {
          name: originalFile.name,
          originalName: originalFile.name,
          blob: bestResult.blob,
          originalSize: originalSize,
          compressedSize: bestResult.blob.size,
          savings: savings,
          url: URL.createObjectURL(bestResult.blob),
          note: `Best PNG compression (target ${maxFileSizeKB} KB not reached)`,
        };

        resolve(compressedFile);
      } else {
        // Return original file
        const compressedFile = {
          name: originalFile.name,
          originalName: originalFile.name,
          blob: originalFile,
          originalSize: originalSize,
          compressedSize: originalSize,
          savings: "0.0",
          url: URL.createObjectURL(originalFile),
          note: `Original kept (${maxFileSizeKB} KB target not achievable)`,
        };

        resolve(compressedFile);
      }
    };

    tryPNGCompression();
  }

  // Special PNG compression method
  compressPNG(canvas, originalFile, quality, resolve) {
    const originalSize = originalFile.size;

    // Try multiple PNG compression strategies
    const strategies = [
      // Strategy 1: Try with reduced color depth
      () => {
        return new Promise((strategyResolve) => {
          // Reduce colors by drawing with reduced quality
          const tempCanvas = document.createElement("canvas");
          const tempCtx = tempCanvas.getContext("2d");
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;

          // Apply some compression techniques
          tempCtx.imageSmoothingEnabled = false; // Reduce smoothing
          tempCtx.drawImage(canvas, 0, 0);

          tempCanvas.toBlob((blob) => {
            strategyResolve({ blob, strategy: "reduced_quality" });
          }, "image/png");
        });
      },

      // Strategy 2: Try smaller dimensions if file is large
      () => {
        return new Promise((strategyResolve) => {
          if (originalSize > 2 * 1024 * 1024) {
            // If > 2MB
            const scale = 0.8; // Reduce by 20%
            const smallCanvas = document.createElement("canvas");
            const smallCtx = smallCanvas.getContext("2d");
            smallCanvas.width = canvas.width * scale;
            smallCanvas.height = canvas.height * scale;

            smallCtx.imageSmoothingEnabled = true;
            smallCtx.imageSmoothingQuality = "high";
            smallCtx.drawImage(
              canvas,
              0,
              0,
              smallCanvas.width,
              smallCanvas.height
            );

            smallCanvas.toBlob((blob) => {
              strategyResolve({ blob, strategy: "smaller_dimensions" });
            }, "image/png");
          } else {
            strategyResolve(null); // Skip this strategy
          }
        });
      },
    ];

    // Try strategies in sequence
    const tryStrategies = async () => {
      let bestResult = null;
      let bestSavings = -Infinity;

      for (const strategy of strategies) {
        try {
          const result = await strategy();
          if (result && result.blob) {
            const savings =
              ((originalSize - result.blob.size) / originalSize) * 100;
            if (savings > bestSavings && result.blob.size < originalSize) {
              bestResult = result;
              bestSavings = savings;
            }
          }
        } catch (error) {
          console.warn("PNG compression strategy failed:", error);
        }
      }

      // If no strategy worked, return original file
      if (!bestResult || bestResult.blob.size >= originalSize) {
        const compressedFile = {
          name: originalFile.name,
          originalName: originalFile.name,
          blob: originalFile,
          originalSize: originalSize,
          compressedSize: originalSize,
          savings: "0.0",
          url: URL.createObjectURL(originalFile),
          note: "Original file kept (PNG compression would increase size)",
        };
        resolve(compressedFile);
        return;
      }

      // Return best compressed result
      const savings = (
        ((originalSize - bestResult.blob.size) / originalSize) *
        100
      ).toFixed(1);

      const compressedFile = {
        name: originalFile.name, // Keep original name and extension
        originalName: originalFile.name,
        blob: bestResult.blob,
        originalSize: originalSize,
        compressedSize: bestResult.blob.size,
        savings: savings,
        url: URL.createObjectURL(bestResult.blob),
        note:
          bestResult.strategy === "smaller_dimensions"
            ? "PNG optimized with reduced dimensions"
            : "PNG optimized",
      };

      resolve(compressedFile);
    };

    tryStrategies();
  }

  // PNG compression with auto-conversion to JPEG when beneficial
  compressPNGWithAutoConversion(
    canvas,
    originalFile,
    quality,
    outputFormat,
    resolve
  ) {
    const originalSize = originalFile.size;

    // First, try PNG compression using existing method
    this.compressPNG(canvas, originalFile, quality, (pngResult) => {
      const pngSavings = parseFloat(pngResult.savings);

      // Define thresholds for when to consider JPEG conversion
      // Only auto-convert when output format is "original" (Keep Original)
      const shouldTryJPEG =
        outputFormat === "original" &&
        (pngSavings < 10 || // Less than 10% savings
          pngResult.compressedSize === originalSize || // No compression achieved
          originalSize > 1024 * 1024); // Large files (>1MB) should be considered for JPEG

      if (!shouldTryJPEG) {
        // PNG compression is acceptable or user chose PNG specifically
        if (outputFormat === "png") {
          pngResult.note = pngResult.note
            ? pngResult.note + " (PNG format preserved as requested)"
            : "PNG format preserved as requested";
        }
        resolve(pngResult);
        return;
      }

      // Try JPEG compression for comparison
      canvas.toBlob(
        (jpegBlob) => {
          const jpegSavings =
            ((originalSize - jpegBlob.size) / originalSize) * 100;
          const jpegSavingsStr = jpegSavings.toFixed(1);

          // Choose the better result
          if (
            jpegBlob.size < pngResult.compressedSize &&
            jpegSavings > pngSavings + 5
          ) {
            // JPEG is significantly better (at least 5% more savings)
            const compressedFile = {
              name: this.changeFileExtension(originalFile.name, "jpg"),
              originalName: originalFile.name,
              blob: jpegBlob,
              originalSize: originalSize,
              compressedSize: jpegBlob.size,
              savings: jpegSavingsStr,
              url: URL.createObjectURL(jpegBlob),
              note: `Auto-converted to JPEG for better compression (${jpegSavingsStr}% vs ${pngResult.savings}% as PNG)`,
            };
            resolve(compressedFile);
          } else {
            // PNG is still better or comparable, keep PNG
            if (
              pngResult.note &&
              pngResult.note.includes("Original file kept")
            ) {
              pngResult.note =
                "PNG kept (no significant benefit from JPEG conversion)";
            }
            resolve(pngResult);
          }
        },
        "image/jpeg",
        Math.min(quality, 0.8)
      );
    });
  }

  // Helper method to calculate optimal dimensions for compression
  calculateOptimalDimensions(originalWidth, originalHeight) {
    const maxWidth = 1920; // Maximum width for web use
    const maxHeight = 1080; // Maximum height for web use

    // If image is already small, don't resize
    if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
      return { width: originalWidth, height: originalHeight };
    }

    // Calculate aspect ratio
    const aspectRatio = originalWidth / originalHeight;

    let newWidth, newHeight;

    if (originalWidth > originalHeight) {
      // Landscape orientation
      newWidth = Math.min(originalWidth, maxWidth);
      newHeight = newWidth / aspectRatio;
    } else {
      // Portrait orientation
      newHeight = Math.min(originalHeight, maxHeight);
      newWidth = newHeight * aspectRatio;
    }

    // Ensure we don't exceed max dimensions
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / aspectRatio;
    }

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }

    return {
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    };
  }

  displayResults() {
    this.resultsGrid.innerHTML = "";

    this.compressedFiles.forEach((file, index) => {
      const resultCard = this.createResultCard(file, index);
      this.resultsGrid.appendChild(resultCard);
    });

    this.resultsSection.style.display = "block";
    this.resultsSection.scrollIntoView({ behavior: "smooth" });

    // Initialize image comparison sliders
    this.initializeImageSliders();
  }

  initializeImageSliders() {
    const sliders = document.querySelectorAll(".image-comparison-slider");

    sliders.forEach((slider) => {
      const handle = slider.querySelector(".slider-handle");
      const compressedImage = slider.querySelector(".compressed-image");
      let isDragging = false;

      // Mouse events
      handle.addEventListener("mousedown", (e) => {
        isDragging = true;
        handle.classList.add("dragging");
        e.preventDefault();
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      });

      // Touch events for mobile
      handle.addEventListener("touchstart", (e) => {
        isDragging = true;
        handle.classList.add("dragging");
        e.preventDefault();
        document.addEventListener("touchmove", handleTouchMove, {
          passive: false,
        });
        document.addEventListener("touchend", handleTouchEnd);
      });

      // Click on slider to move handle
      slider.addEventListener("click", (e) => {
        if (!isDragging && e.target !== handle) {
          const rect = slider.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = (x / rect.width) * 100;
          updateSliderPosition(Math.max(0, Math.min(100, percentage)));
        }
      });

      function handleMouseMove(e) {
        if (!isDragging) return;
        const rect = slider.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        updateSliderPosition(Math.max(0, Math.min(100, percentage)));
      }

      function handleTouchMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        const rect = slider.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        updateSliderPosition(Math.max(0, Math.min(100, percentage)));
      }

      function handleMouseUp() {
        isDragging = false;
        handle.classList.remove("dragging");
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }

      function handleTouchEnd() {
        isDragging = false;
        handle.classList.remove("dragging");
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      }

      function updateSliderPosition(percentage) {
        handle.style.left = `${percentage}%`;
        compressedImage.style.clipPath = `inset(0 0 0 ${percentage}%)`;
      }
    });
  }

  createResultCard(file, index) {
    const card = document.createElement("div");
    card.className = "result-card fade-in-up";
    card.style.animationDelay = `${index * 0.1}s`;

    const noteHtml = file.note
      ? `<div class="compression-note"><i class="fas fa-info-circle"></i> ${file.note}</div>`
      : "";

    // Create original image preview URL
    const originalFile = this.selectedFiles[index];
    const originalImageURL = URL.createObjectURL(originalFile);

    card.innerHTML = `
            <div class="result-header">
                <span class="result-filename">${file.name}</span>
            </div>
            <div class="result-images">
                <div class="image-comparison-slider" data-index="${index}">
                    <img src="${originalImageURL}" alt="Original ${
      file.originalName
    }" class="comparison-image original-image" />
                    <img src="${file.url}" alt="Compressed ${
      file.name
    }" class="comparison-image compressed-image" />
                    <div class="slider-handle"></div>
                    <div class="image-labels">
                        <div class="image-label original">Original</div>
                        <div class="image-label compressed">Compressed</div>
                    </div>
                </div>
            </div>
            <div class="result-stats">
                <div class="stat-item">
                    <div class="stat-value">${this.formatFileSize(
                      file.originalSize
                    )}</div>
                    <div class="stat-label">Original</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.formatFileSize(
                      file.compressedSize
                    )}</div>
                    <div class="stat-label">Compressed</div>
                </div>
            </div>
            <div class="compression-info">
                <div class="savings ${
                  parseFloat(file.savings) > 0
                    ? "positive"
                    : parseFloat(file.savings) < 0
                    ? "negative"
                    : "neutral"
                }">
                    <i class="fas fa-${
                      parseFloat(file.savings) >= 0 ? "arrow-down" : "arrow-up"
                    }"></i>
                    ${Math.abs(parseFloat(file.savings))}% ${
      parseFloat(file.savings) > 0
        ? "smaller"
        : parseFloat(file.savings) < 0
        ? "larger"
        : "same size"
    }
                </div>
                ${noteHtml}
            </div>
            <button class="download-btn" onclick="imageCompressor.downloadFile(${index})">
                <i class="fas fa-download"></i>
                Download
            </button>
        `;

    return card;
  }

  downloadFile(index) {
    const file = this.compressedFiles[index];
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async downloadAllImages() {
    if (this.compressedFiles.length === 0) {
      this.showNotification("No compressed images to download!", "error");
      return;
    }

    // For single file, download directly
    if (this.compressedFiles.length === 1) {
      this.downloadFile(0);
      return;
    }

    // For multiple files, create a zip
    try {
      this.showNotification("Preparing download...", "info");

      // Simple approach: download files one by one with delay
      for (let i = 0; i < this.compressedFiles.length; i++) {
        setTimeout(() => {
          this.downloadFile(i);
        }, i * 500); // 500ms delay between downloads
      }

      this.showNotification(
        "Downloads started! Files will download one by one.",
        "success"
      );
    } catch (error) {
      console.error("Download error:", error);
      this.showNotification(
        "Error creating download. Please download files individually.",
        "error"
      );
    }
  }

  async downloadAsZip() {
    if (this.compressedFiles.length === 0) {
      this.showNotification("No compressed images to download!", "error");
      return;
    }

    if (!window.JSZip) {
      this.showNotification("ZIP functionality not available!", "error");
      return;
    }

    try {
      this.showNotification("Creating ZIP file...", "info");

      const zip = new JSZip();
      const promises = [];

      // Add each compressed file to the ZIP
      this.compressedFiles.forEach((file, index) => {
        const promise = fetch(file.url)
          .then((response) => response.blob())
          .then((blob) => {
            zip.file(file.name, blob);
          });
        promises.push(promise);
      });

      // Wait for all files to be added
      await Promise.all(promises);

      // Generate ZIP file
      this.showNotification("Generating ZIP file...", "info");
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6,
        },
      });

      // Create download link
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `compressed-images-${new Date()
        .toISOString()
        .slice(0, 10)}.zip`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 1000);

      this.showNotification("ZIP file downloaded successfully!", "success");
    } catch (error) {
      console.error("ZIP creation error:", error);
      this.showNotification(
        "Error creating ZIP file. Please download files individually.",
        "error"
      );
    }
  }

  showProgressModal() {
    this.progressModal.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  hideProgressModal() {
    this.progressModal.style.display = "none";
    document.body.style.overflow = "auto";
  }

  updateProgress(percentage, text) {
    this.progressFill.style.width = `${percentage}%`;
    this.progressText.textContent = `${Math.round(percentage)}%`;
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

    // Add styles
    Object.assign(notification.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      backgroundColor: this.getNotificationColor(type),
      color: "white",
      padding: "1rem 1.5rem",
      borderRadius: "10px",
      zIndex: "10000",
      fontSize: "1rem",
      fontWeight: "500",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
      transform: "translateX(400px)",
      transition: "transform 0.3s ease",
    });

    // Style notification content
    const content = notification.querySelector(".notification-content");
    Object.assign(content.style, {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    });

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Remove after delay
    setTimeout(() => {
      notification.style.transform = "translateX(400px)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }

  getNotificationIcon(type) {
    switch (type) {
      case "success":
        return "check-circle";
      case "error":
        return "exclamation-circle";
      case "warning":
        return "exclamation-triangle";
      default:
        return "info-circle";
    }
  }

  getNotificationColor(type) {
    switch (type) {
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      default:
        return "#3b82f6";
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  getFileExtension(filename) {
    return filename.split(".").pop().toLowerCase();
  }

  changeFileExtension(filename, newExtension) {
    const name = filename.substring(0, filename.lastIndexOf("."));
    return `${name}.${newExtension}`;
  }

  // Reset functionality
  reset() {
    // Clean up object URLs to prevent memory leaks
    this.selectedFiles.forEach((file) => {
      if (file.objectURL) {
        URL.revokeObjectURL(file.objectURL);
      }
    });

    this.compressedFiles.forEach((file) => {
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
    });

    this.selectedFiles = [];
    this.compressedFiles = [];
    this.compressBtn.disabled = true;
    this.resultsSection.style.display = "none";

    // Hide image previews
    this.selectedImages.style.display = "none";
    this.imagePreviewGrid.innerHTML = "";

    // Reset compression method to quality-based
    const qualityRadio = document.querySelector(
      'input[name="compressionMethod"][value="quality"]'
    );
    if (qualityRadio) {
      qualityRadio.checked = true;
      this.qualityGroup.style.display = "flex";
      this.sizeGroup.style.display = "none";
    }

    // Reset form values
    this.qualitySlider.value = 80;
    this.qualityValue.textContent = "80%";
    this.maxFileSizeInput.value = "";
    this.formatSelect.value = "original";

    // Reset upload area
    const uploadContent = this.uploadArea.querySelector(".upload-content");
    uploadContent.innerHTML = `
            <i class="fas fa-cloud-upload-alt upload-icon"></i>
            <h3>Drop your images here</h3>
            <p>or <span class="upload-link">browse files</span></p>
        `;

    // Re-attach browse files listener
    document
      .querySelector(".upload-link")
      .addEventListener("click", () => this.fileInput.click());

    // Clear file input
    this.fileInput.value = "";
  }

  initializeDemoSlider() {
    const demoSliderHandle = document.querySelector(".demo-slider-handle");
    const demoCompressed = document.querySelector(".demo-compressed");
    const demoImageComparison = document.querySelector(
      ".demo-image-comparison"
    );

    if (!demoSliderHandle || !demoCompressed || !demoImageComparison) {
      return; // Elements not found, exit gracefully
    }

    let isDragging = false;

    // Mouse events
    demoSliderHandle.addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);

    // Touch events
    demoSliderHandle.addEventListener("touchstart", startDrag);
    document.addEventListener("touchmove", drag);
    document.addEventListener("touchend", stopDrag);

    function startDrag(e) {
      e.preventDefault();
      isDragging = true;
      demoSliderHandle.style.transition = "none";
      demoCompressed.style.transition = "none";
    }

    function drag(e) {
      if (!isDragging) return;

      e.preventDefault();

      const rect = demoImageComparison.getBoundingClientRect();
      const x =
        (e.type.includes("touch") ? e.touches[0].clientX : e.clientX) -
        rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

      updateSliderPosition(percentage);
    }

    function stopDrag() {
      if (!isDragging) return;

      isDragging = false;
      demoSliderHandle.style.transition = "";
      demoCompressed.style.transition = "";
    }

    function updateSliderPosition(percentage) {
      demoSliderHandle.style.left = `${percentage}%`;
      demoCompressed.style.clipPath = `inset(0 0 0 ${percentage}%)`;
    }

    // Auto-play animation on scroll into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              // Animate from 50% to 20% to 80% and back to 50%
              animateSlider(50, 20, 1000);
              setTimeout(() => {
                animateSlider(20, 80, 1500);
                setTimeout(() => {
                  animateSlider(80, 50, 1000);
                }, 1600);
              }, 1100);
            }, 500);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(demoImageComparison);

    function animateSlider(from, to, duration) {
      const startTime = Date.now();

      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeInOut =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const currentPercentage = from + (to - from) * easeInOut;
        updateSliderPosition(currentPercentage);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }

      requestAnimationFrame(animate);
    }

    // Create compressed version of the demo image
    setTimeout(() => {
      this.createDemoCompressedImage();
    }, 100);
  }

  async createDemoCompressedImage() {
    const demoCompressed = document.querySelector(".demo-compressed");
    const demoOriginal = document.querySelector(".demo-original");

    if (!demoCompressed || !demoOriginal) return;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.crossOrigin = "anonymous";
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0);

        // Create compressed version with lower quality
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.3);
        demoCompressed.src = compressedDataUrl;
      };

      img.src = demoOriginal.src;
    } catch (error) {
      console.log("Demo image compression simulation failed:", error);
      // Fallback: use same image with different filter
      demoCompressed.style.filter = "contrast(1.1) saturate(0.9)";
    }
  }
}

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      compressionTimes: [],
      totalFiles: 0,
      totalSavings: 0,
    };
  }

  recordCompression(startTime, endTime, originalSize, compressedSize) {
    const compressionTime = endTime - startTime;
    this.metrics.compressionTimes.push(compressionTime);
    this.metrics.totalFiles++;
    this.metrics.totalSavings += originalSize - compressedSize;
  }

  getAverageCompressionTime() {
    if (this.metrics.compressionTimes.length === 0) return 0;
    const sum = this.metrics.compressionTimes.reduce((a, b) => a + b, 0);
    return sum / this.metrics.compressionTimes.length;
  }

  getTotalSavings() {
    return this.metrics.totalSavings;
  }
}

// Lazy loading for images and animations
class LazyLoader {
  constructor() {
    this.initIntersectionObserver();
  }

  initIntersectionObserver() {
    if ("IntersectionObserver" in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("fade-in-up");
              this.observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -50px 0px",
        }
      );

      // Observe elements
      document.querySelectorAll(".feature-card, .stat").forEach((el) => {
        this.observer.observe(el);
      });
    }
  }
}

// FAQ Functionality
function initializeFAQ() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {
      // Close other open FAQ items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active");
        }
      });

      // Toggle current item
      item.classList.toggle("active");
    });
  });
}

// Testimonial Videos Functionality
function initializeTestimonialVideos() {
  const testimonialVideoContainers =
    document.querySelectorAll(".testimonial-video");

  testimonialVideoContainers.forEach((container) => {
    const video = container.querySelector("video");
    const playOverlay = container.querySelector(".video-play-overlay");
    const playButton = container.querySelector(".play-button");
    const playIcon = playButton.querySelector("i");

    if (!video || !playOverlay || !playButton) return;

    // Set initial state
    video.muted = true; // Start muted
    video.controls = false; // Remove default controls
    container.classList.remove("playing");

    // Handle container click to play/pause
    container.addEventListener("click", (e) => {
      e.preventDefault();
      toggleVideo();
    });

    // Handle play button click specifically
    playButton.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleVideo();
    });

    function toggleVideo() {
      if (video.paused) {
        playVideo();
      } else {
        pauseVideo();
      }
    }

    function playVideo() {
      // Unmute and play with sound when user clicks
      video.muted = false;
      video
        .play()
        .then(() => {
          container.classList.add("playing");
          playIcon.className = "fas fa-pause";
          playButton.classList.add("pause");

          // Pause all other videos
          pauseOtherVideos(container);
        })
        .catch((error) => {
          console.warn("Video play failed:", error);
          // Fallback: try with muted if unmuted fails
          video.muted = true;
          video
            .play()
            .then(() => {
              container.classList.add("playing");
              playIcon.className = "fas fa-pause";
              playButton.classList.add("pause");
              pauseOtherVideos(container);
            })
            .catch((fallbackError) => {
              console.error(
                "Video play failed even when muted:",
                fallbackError
              );
            });
        });
    }

    function pauseVideo() {
      video.pause();
      container.classList.remove("playing");
      playIcon.className = "fas fa-play";
      playButton.classList.remove("pause");
    }

    // Handle video events
    video.addEventListener("play", () => {
      container.classList.add("playing");
      playIcon.className = "fas fa-pause";
      playButton.classList.add("pause");
    });

    video.addEventListener("pause", () => {
      container.classList.remove("playing");
      playIcon.className = "fas fa-play";
      playButton.classList.remove("pause");
    });

    video.addEventListener("ended", () => {
      container.classList.remove("playing");
      playIcon.className = "fas fa-play";
      playButton.classList.remove("pause");
      video.muted = true; // Reset to muted state
    });

    // Handle video loading errors
    video.addEventListener("error", (e) => {
      console.warn("Video failed to load:", video.src);
      // Show fallback content
      playOverlay.innerHTML = `
        <div class="play-button error">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
      `;
      playOverlay.style.background = "rgba(255, 0, 0, 0.1)";
    });

    // Handle loading state
    video.addEventListener("loadstart", () => {
      playButton.style.opacity = "0.7";
    });

    video.addEventListener("loadeddata", () => {
      playButton.style.opacity = "1";
    });
  });

  // Function to pause all other videos when one starts playing
  function pauseOtherVideos(currentContainer) {
    const allContainers = document.querySelectorAll(".testimonial-video");
    allContainers.forEach((container) => {
      if (container !== currentContainer) {
        const video = container.querySelector("video");
        const playIcon = container.querySelector(".play-button i");
        const playButton = container.querySelector(".play-button");

        if (video && !video.paused) {
          video.pause();
          container.classList.remove("playing");
          if (playIcon) playIcon.className = "fas fa-play";
          if (playButton) playButton.classList.remove("pause");
        }
      }
    });
  }
}

// Initialize the application
let imageCompressor;
let performanceMonitor;
let lazyLoader;

document.addEventListener("DOMContentLoaded", () => {
  // Initialize components
  imageCompressor = new ImageCompressor();
  performanceMonitor = new PerformanceMonitor();
  lazyLoader = new LazyLoader();

  // Initialize FAQ functionality
  initializeFAQ();

  // Add some helpful global functions
  window.imageCompressor = imageCompressor;

  // Add keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + U to open file dialog
    if ((e.ctrlKey || e.metaKey) && e.key === "u") {
      e.preventDefault();
      imageCompressor.fileInput.click();
    }

    // Escape to close modal
    if (e.key === "Escape") {
      imageCompressor.hideProgressModal();
    }
  });

  // PWA-like experience
  if ("serviceWorker" in navigator) {
    // Could register a service worker here for offline functionality
    console.log("ServiceWorker supported");
  }

  // Analytics-like tracking (privacy-friendly)
  console.log("ImageCompress Pro initialized successfully");

  // Initialize testimonial videos
  initializeTestimonialVideos();
});

// Handle page visibility changes
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Page is hidden - pause any ongoing operations if needed
    console.log("Page hidden");
  } else {
    // Page is visible - resume operations if needed
    console.log("Page visible");
  }
});
