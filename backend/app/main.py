from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware import cors
from PIL import Image
import torch.nn as nn
import torch
import uvicorn
from torchvision import transforms
import os

IMAGE_SIZE = 150

app = FastAPI()
app.add_middleware(
    cors.CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)


torch.cuda.empty_cache()
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Define the CNN model
class BrainTumorModel(nn.Module):
    def __init__(self):
        super(BrainTumorModel, self).__init__()
        self.conv_layers = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
        )
        self.fc_layers = nn.Sequential(
            nn.Flatten(),
            nn.Linear(256 * 9 * 9, 128),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(64, 4)
        )
    def forward(self, x):
        x = self.conv_layers(x)
        x = self.fc_layers(x)
        return x
    def predict(self, x):
        with torch.no_grad():
            x = self.forward(x)
            return torch.softmax(x, dim=1)
        

checkpoint = torch.load('model/best_model.pt', map_location=device, weights_only=True)
model = BrainTumorModel().to(device)
model.load_state_dict(checkpoint['model_state_dict'])
model.eval()

transform = transforms.Compose([
    # transforms.ToPILImage(),
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5])
])

labels = ['glioma tumor', 'meningioma tumor', 'no tumor', 'pituitary tumor']

@app.post("/classify/")
async def classify_image(file: UploadFile = File(...)):
    try:
        image = Image.open(file.file).convert('RGB')
        image = transform(image).unsqueeze(0).to(device)

        outputs = model(image)
        _, predicted = torch.max(outputs, 1)

        return JSONResponse(content={'class': labels[predicted.item()]})
    except Exception as e:
        return JSONResponse(content={'error': str(e)}, status_code=500)


if __name__ == '__main__':
    uvicorn.run(app, port=5000, reload=True)