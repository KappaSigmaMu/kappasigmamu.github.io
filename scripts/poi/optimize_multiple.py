import os
import sys
from rename_and_optimize import resize_image


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
