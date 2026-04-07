# Image Optimization Script
# هذا السكريبت يقوم بضغط الصور وتحويلها إلى WebP

import os
from PIL import Image
from pathlib import Path

def optimize_images(input_dir='banner', output_dir='banner/optimized', quality=85):
    """
    ضغط الصور وتحويلها إلى WebP

    Args:
        input_dir: مجلد الصور الأصلي
        output_dir: مجلد الصور المضغوطة
        quality: جودة الصورة (1-100)
    """
    # إنشاء مجلد الإخراج إذا لم يكن موجوداً
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    # الامتدادات المدعومة
    supported_formats = ['.png', '.jpg', '.jpeg', '.gif']

    # معالجة كل صورة
    for filename in os.listdir(input_dir):
        file_path = os.path.join(input_dir, filename)

        # التحقق من أن الملف صورة
        if not any(filename.lower().endswith(ext) for ext in supported_formats):
            continue

        try:
            # فتح الصورة
            with Image.open(file_path) as img:
                # تحويل الصورة إلى RGB إذا كانت RGBA
                if img.mode == 'RGBA':
                    img = img.convert('RGB')

                # إنشاء اسم الملف الجديد
                output_filename = os.path.splitext(filename)[0] + '.webp'
                output_path = os.path.join(output_dir, output_filename)

                # حفظ الصورة بتنسيق WebP
                img.save(output_path, 'webp', quality=quality, optimize=True)

                # عرض معلومات الضغط
                original_size = os.path.getsize(file_path)
                compressed_size = os.path.getsize(output_path)
                reduction = ((original_size - compressed_size) / original_size) * 100

                print(f"✓ {filename}: {original_size/1024:.1f}KB → {compressed_size/1024:.1f}KB ({reduction:.1f}% reduction)")

        except Exception as e:
            print(f"✗ Error processing {filename}: {str(e)}")

if __name__ == "__main__":
    print("بدء عملية ضغط الصور...")
    optimize_images()
    print("\nتم الانتهاء من ضغط الصور!")
