import sys
import requests
import os
import json


def download(ipfs_hash, download_path):
    try:
        ls_response = requests.post(
            f'http://127.0.0.1:5001/api/v0/ls?arg={ipfs_hash}')
        if ls_response.status_code != 200:
            raise Exception(
                f"Error listing folder contents: {ls_response.text}")

        folder_contents = json.loads(ls_response.text)['Objects'][0]['Links']

        if not os.path.exists(download_path):
            os.makedirs(download_path)

        for item in folder_contents:
            file_name = item['Name']
            file_hash = item['Hash']
            file_path = os.path.join(download_path, file_name)

            cat_response = requests.post(
                f'http://127.0.0.1:5001/api/v0/cat?arg={file_hash}', stream=True)
            if cat_response.status_code != 200:
                raise Exception(
                    f"Error downloading file {file_name}: {cat_response.text}")

            with open(file_path, 'wb') as f:
                for chunk in cat_response.iter_content(chunk_size=8192):
                    f.write(chunk)

            print(f"Downloaded {file_name} to {download_path}")
    except Exception as e:
        print(f"Error: {e}")


def main():
    if len(sys.argv) != 3:
        print("Usage: python3 download.py <ipfs_hash> <download_path>")
        sys.exit(1)

    ipfs_hash = sys.argv[1]
    download_path = sys.argv[2]

    download(ipfs_hash, download_path)


if __name__ == "__main__":
    main()
