
/**
 * Processes an image file: resizes it and compresses it to JPEG format
 * to ensure it is small enough for LocalStorage and fast loading.
 */
export const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Maximum dimensions - optimized for web
                const MAX_WIDTH = 1000; 
                const MAX_HEIGHT = 1000;
                
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }
                
                // Draw image on canvas
                ctx.drawImage(img, 0, 0, width, height);
                
                // Compress to JPEG with 0.7 quality (good balance of size/quality)
                const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                resolve(optimizedDataUrl);
            };
            
            img.onerror = (error) => reject(error);
        };
        
        reader.onerror = (error) => reject(error);
    });
};
