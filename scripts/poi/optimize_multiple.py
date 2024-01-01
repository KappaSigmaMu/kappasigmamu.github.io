import os
import sys
from PIL import Image, UnidentifiedImageError, ExifTags


def resize_image(input_path, output_path):
    try:
        with Image.open(input_path) as img:
            if img.height > 1000 or img.width > 1000:
                img.thumbnail((1000, 1000))

            try:
                for orientation in ExifTags.TAGS.keys():
                    if ExifTags.TAGS[orientation] == 'Orientation':
                        break

                exif = dict(img._getexif().items())
                if exif[orientation] == 3:
                    img = img.rotate(180, expand=True)
                elif exif[orientation] == 6:
                    img = img.rotate(270, expand=True)
                elif exif[orientation] == 8:
                    img = img.rotate(90, expand=True)
            except (AttributeError, KeyError, IndexError):
                pass

            if img.mode == 'RGBA':
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background

            img.save(output_path, format='JPEG', quality=85, optimize=True)
    except UnidentifiedImageError:
        print(f'File is not an image or cannot be identified: {input_path}')


def process_images(folder_path):
    for filename in os.listdir(folder_path):
        if filename.endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
            file_path = os.path.join(folder_path, filename)

            new_filename = os.path.splitext(filename)[0] + '.jpg'
            new_file_path = os.path.join(folder_path, new_filename)

            resize_image(file_path, new_file_path)

            if new_file_path != file_path:
                os.remove(file_path)
            print(f'Optimized {filename}')
        else:
            print(f'File not supported {filename}')


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 optimize_multiple.py <folder_path>")
        sys.exit(1)

    folder_path = sys.argv[1]

    process_images(folder_path)


if __name__ == "__main__":
    main()
