<!-- increase size of the logo -->
<img src="./judee-web/src/assets/wall-e.svg" alt="Jude-E Logo" style="width: 200px; height: auto; margin: 0 auto; display: block;"/>

# Jude-E

<!-- add image from judee-web/src/assets/wall-e.svg -->

Jude-E is an AI-powered assistant designed to help Patients navigate and understand St. Jude facility and resources available on the campus.

## How to run the project

### Ollama

Download and install Ollama by following instructions from this offical [Ollama site](https://ollama.ai/)

	You can check if Ollama is running by visiting http://localhost:11434/ in your default browser.

> [!CAUTION]
> After installing Ollama, close any open Terminal/Command Prompt before you pull Qwen3:1.7b.

Once you start Ollama, you have to pull qwen3:1.7b model by running following command:

```
ollama pull qwen3:1.7b
```

### Frontend
1. Install Node.js and npm if you haven't already.
2. Navigate to the `judee-web` directory:
   ```bash
   cd judee-web
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. The frontend will be running at `http://localhost:5173`.

### Backend

1. Install docker and docker-compose if you haven't already.
2. Build the docker image for the backend:
   ```bash
   docker-compose build backend
   ```
3. Run the backend container:
   ```bash
   docker-compose up backend
   ```
4. Load the library files using python script:
   ```bash
   docker exec -it <backend_container_id> python utils/create_chroma.py
   ```
5. The backend server will be running at `http://localhost:8000`.