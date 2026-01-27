"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
    image: string;
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
    aspectRatio?: number;
}

export default function ImageCropper({ image, onCropComplete, onCancel, aspectRatio = 19 / 6 }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropChange = (crop: any) => setCrop(crop);
    const onZoomChange = (zoom: any) => setZoom(zoom);

    const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error('No 2d context');

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const handleConfirm = async () => {
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
            <div className="flex justify-between items-center p-6 bg-black/50 backdrop-blur-md">
                <div className="flex flex-col">
                    <h3 className="text-white font-black uppercase tracking-tighter text-xl">Adjust Thumbnail</h3>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Crop your image to 19:6 aspect ratio</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={onCancel}
                        className="p-3 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                    >
                        <Check size={18} /> Apply Crop
                    </button>
                </div>
            </div>

            <div className="relative flex-1 bg-[#1a1a1a]">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspectRatio}
                    onCropChange={onCropChange}
                    onCropComplete={onCropCompleteInternal}
                    onZoomChange={onZoomChange}
                />
            </div>

            <div className="p-8 bg-black/50 backdrop-blur-md flex flex-col items-center gap-4">
                <div className="flex items-center gap-6 w-full max-w-md">
                    <ZoomOut size={18} className="text-gray-400" />
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e: any) => setZoom(e.target.value)}
                        className="flex-1 accent-primary h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <ZoomIn size={18} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Scroll or use slider to zoom</p>
            </div>
        </div>
    );
}
