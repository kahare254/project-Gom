import os
import signal
import subprocess
import time
import psutil
import requests

def kill_ngrok():
    """Kill any running ngrok processes"""
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            if 'ngrok' in proc.info['name'].lower():
                os.kill(proc.info['pid'], signal.SIGTERM)
                print(f"Killed ngrok process with PID {proc.info['pid']}")
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass

def get_ngrok_url():
    """Get the public URL from ngrok API"""
    try:
        response = requests.get("http://127.0.0.1:4040/api/tunnels")
        tunnels = response.json()['tunnels']
        for tunnel in tunnels:
            if tunnel['proto'] == 'https':
                return tunnel['public_url']
    except Exception as e:
        print(f"Error getting ngrok URL: {e}")
    return None

def main():
    # Kill any existing ngrok processes
    kill_ngrok()
    time.sleep(2)  # Wait for processes to terminate
    
    # Start ngrok in a new process
    try:
        ngrok_process = subprocess.Popen(
            ['ngrok', 'http', '5000'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        print("Started ngrok process")
        
        # Wait for ngrok to start and get the URL
        time.sleep(3)  # Give ngrok time to start
        url = get_ngrok_url()
        
        if url:
            print(f"\nNgrok tunnel established!")
            print(f"Public URL: {url}")
            print("\nPress Ctrl+C to stop ngrok")
            
            # Keep the script running
            try:
                ngrok_process.wait()
            except KeyboardInterrupt:
                print("\nStopping ngrok...")
                kill_ngrok()
        else:
            print("Failed to get ngrok URL. Make sure ngrok is properly configured.")
            
    except FileNotFoundError:
        print("Error: ngrok not found. Please make sure ngrok is installed and in your PATH.")
        print("You can install ngrok from: https://ngrok.com/download")
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        kill_ngrok()

if __name__ == "__main__":
    main() 