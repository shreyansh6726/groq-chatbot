Groq Chatbot

A fully functional chatbot built using React (Vite) for the frontend and Vercel Serverless Functions for backend API handling.
This project integrates the Groq API to generate fast, high-quality responses using state-of-the-art open-source language models like Gemma and Llama.

This repository demonstrates how to structure a modern AI-powered project while keeping the API key secure, making it suitable for learning, student projects, portfolio showcases, and real deployments.

Project Overview

The Groq Chatbot is an interactive web application that allows users to send messages and receive intelligent responses in real time. It is powered by the Groq Cloud API, which provides extremely fast inference for open-source models.

Since API keys must remain confidential, the project uses Vercel's Serverless Functions to proxy API requests securely. The frontend communicates with a backend route hosted on Vercel, which then calls the Groq API and returns the response to the browser.

The project is optimized for deployment on Vercel and integrates cleanly with GitHub for automatic builds and updates.

Key Features
1. Modern Frontend (React + Vite)

The user interface is built with React and bundled with Vite, providing:

Fast local development

Lightweight and optimized build outputs

Easy component-based structure

2. Secure Backend (Vercel Serverless Functions)

All API calls to Groq are handled using Vercel’s serverless backend.
This provides:

Zero server management

Secure handling of private API keys

Automatic scaling

Simple API routing structure

3. Integration with Groq API

The chatbot uses the official Groq JavaScript SDK to generate responses using high-performance models such as:

gemma2-9b-it

llama3-8b

mixtral 8x7b

Groq’s cloud infrastructure allows extremely low-latency responses, which improves the overall chat experience.

4. Fully Deployable on Vercel

The entire project is designed for smooth deployment on Vercel with:

Continuous Deployment from GitHub

Built-in environment variable support

Serverless API functions

Automatic SSL and hosting

How It Works
1. User sends a message

The user types a message in the frontend interface.
React tracks this input using component state.

2. Frontend sends request to backend

The frontend sends a POST request to:

```
/api/chat

```
This route exists inside the api folder and is deployed as a serverless function.
3. Serverless function calls Groq API
The backend function:


Reads the user’s input


Connects to Groq Cloud using the SDK


Sends the message to a chosen model


Receives the model’s generated output


4. Response is returned to the browser
The backend sends the model’s reply back to the frontend, where it is displayed in the chat interface.
This ensures the Groq API key remains hidden and secure.

Technologies Used
Frontend


React


Vite


JavaScript ES6


HTML & CSS


Backend


Vercel Serverless Functions


Groq JavaScript SDK


Deployment


Vercel


GitHub Repository Integration



Why This Project Is Useful
This project teaches how modern AI applications are built using:


A fast, reactive frontend framework


A secure serverless backend


Powerful AI inference engines


Cloud deployment workflows


It is an excellent learning resource for:


Students


Web developers


Beginners exploring AI integration


Anyone building portfolio projects



Future Improvements
Possible enhancements include:


Conversational memory


Better UI styling


Typing animations


Error handling and loading indicators


Multiple model selection


Dark mode support
