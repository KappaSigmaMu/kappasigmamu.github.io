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


def process_image(image_path, member_hash):
    if image_path.endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
        directory = os.path.dirname(image_path)

        new_filename = f"{member_hash}.jpg"
        new_image_path = os.path.join(directory, new_filename)

        os.rename(image_path, new_image_path)
        print(f"Image renamed to: {new_filename}")

        resize_image(new_image_path, new_image_path)
        print(f'Optimized {new_filename}')
    else:
        print(f'File not supported {image_path}')


def main():
    if len(sys.argv) != 3:
        print("Usage: python3 rename_and_optimize.py <image_path> <member_hash>")
        sys.exit(1)

    image_path = sys.argv[1]
    member_hash = sys.argv[2]

    process_image(image_path, member_hash)


if __name__ == "__main__":
    main()
