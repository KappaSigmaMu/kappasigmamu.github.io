import subprocess
import sys
import requests
import json
import os


def upload_file_to_ipfs(file_path):
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(
            'http://127.0.0.1:5001/api/v0/add', files=files)
        if response.status_code == 200:
            return json.loads(response.text).get('Hash')
        else:
            print(f"Error uploading file to IPFS: {response.text}")
            return None


def get_current_folder_hash(ipns_key):
    response = requests.post(
        f'http://127.0.0.1:5001/api/v0/name/resolve?arg={ipns_key}')
    if response.status_code == 200:
        resolved_path = json.loads(response.text).get('Path')
        folder_hash = resolved_path.split('/')[-1]
        return folder_hash
    else:
        print(f"Error resolving IPNS key: {response.text}")
        return None


def update_folder_with_file(folder_hash, file_hash, file_path):
    file_name = os.path.basename(file_path)
    folder_path = f'/ipfs/{folder_hash}'
    file_path = f'/ipfs/{file_hash}'

    command = f"ipfs object patch add-link {folder_path} {file_name} {file_path} --allow-big-block"

    result = subprocess.run(command, shell=True,
                            capture_output=True, text=True)

    if result.returncode == 0:
        new_folder_hash = result.stdout.strip()
        return new_folder_hash
    else:
        print(f"Error updating folder on IPFS: {result.stderr}")
        return None


def publish_to_ipns(folder_hash, key_name):
    response = requests.post(
        f'http://127.0.0.1:5001/api/v0/name/publish?arg=/ipfs/{folder_hash}&key={key_name}')
    if response.status_code == 200:
        response_json = json.loads(response.text)
        if 'Name' in response_json:
            return response_json['Name']
        else:
            print(f"Unexpected response format: {response.text}")
            return None
    else:
        print(f"Error publishing to IPNS: {response.text}")
        return None


def upload(file_path, ipns_key):
    file_hash = upload_file_to_ipfs(file_path)
    current_folder_hash = get_current_folder_hash(ipns_key)

    if current_folder_hash:
        new_folder_hash = update_folder_with_file(
            current_folder_hash, file_hash, file_path)
        ipns_name = publish_to_ipns(new_folder_hash, ipns_key)
        print(f"New folder hash: {new_folder_hash}")
        print(f"Published to IPNS under name: {ipns_name}")
    else:
        print("Could not retrieve current folder hash. Make sure the IPNS key exists and is resolvable.")


def main():
    if len(sys.argv) != 3:
        print("Usage: python3 upload.py <file_path> <ipns_key>")
        sys.exit(1)

    file_path = sys.argv[1]
    ipns_key = sys.argv[2]

    upload(file_path, ipns_key)


if __name__ == "__main__":
    main()
