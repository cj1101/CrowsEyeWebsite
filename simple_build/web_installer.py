
import os
import sys
import urllib.request
import json
import hashlib
import tkinter as tk
from tkinter import messagebox, ttk
import threading
import subprocess
import tempfile
import shutil

class SimpleWebInstaller:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Crow's Eye Marketing Suite Installer")
        self.root.geometry("400x300")
        self.root.resizable(False, False)
        
        # Center the window
        self.root.eval('tk::PlaceWindow . center')
        
        self.setup_ui()
        
    def setup_ui(self):
        # Header
        header_frame = tk.Frame(self.root, bg="#2c3e50", height=60)
        header_frame.pack(fill="x")
        header_frame.pack_propagate(False)
        
        title_label = tk.Label(header_frame, text="Crow's Eye Marketing Suite", 
                              font=("Arial", 14, "bold"), fg="white", bg="#2c3e50")
        title_label.pack(pady=15)
        
        # Main content
        main_frame = tk.Frame(self.root, padx=20, pady=20)
        main_frame.pack(fill="both", expand=True)
        
        # Description
        desc_text = "This installer will download and install\nthe latest version of Crow's Eye Marketing Suite."
        desc_label = tk.Label(main_frame, text=desc_text, justify="center")
        desc_label.pack(pady=10)
        
        # Progress bar
        self.progress = ttk.Progressbar(main_frame, length=300, mode='determinate')
        self.progress.pack(pady=20)
        
        # Status label
        self.status_label = tk.Label(main_frame, text="Ready to install", fg="blue")
        self.status_label.pack(pady=5)
        
        # Buttons
        button_frame = tk.Frame(main_frame)
        button_frame.pack(pady=20)
        
        self.install_button = tk.Button(button_frame, text="Install", 
                                       command=self.start_installation, 
                                       bg="#3498db", fg="white", padx=20, pady=5)
        self.install_button.pack(side="left", padx=10)
        
        cancel_button = tk.Button(button_frame, text="Cancel", 
                                 command=self.root.quit, padx=20, pady=5)
        cancel_button.pack(side="left", padx=10)
        
    def start_installation(self):
        self.install_button.config(state="disabled")
        self.status_label.config(text="Starting installation...", fg="blue")
        
        # Start installation in a separate thread
        thread = threading.Thread(target=self.install_app)
        thread.daemon = True
        thread.start()
        
    def update_progress(self, value, status):
        self.progress['value'] = value
        self.status_label.config(text=status)
        self.root.update()
        
    def install_app(self):
        try:
            # Simulate download and installation
            self.update_progress(20, "Downloading application...")
            
            # For demo purposes, we'll just show the process
            # In a real implementation, this would download from your website
            import time
            time.sleep(2)
            
            self.update_progress(60, "Installing application...")
            time.sleep(1)
            
            self.update_progress(90, "Finalizing installation...")
            time.sleep(1)
            
            self.update_progress(100, "Installation complete!")
            
            messagebox.showinfo("Success", "Installation completed successfully!")
            self.root.quit()
            
        except Exception as e:
            messagebox.showerror("Error", f"Installation failed: {str(e)}")
            self.install_button.config(state="normal")
            self.status_label.config(text="Installation failed", fg="red")
    
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    installer = SimpleWebInstaller()
    installer.run()
