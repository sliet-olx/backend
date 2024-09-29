# Use an official Node.js runtime as a base image (Alpine version)
FROM node:alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to ensure dependencies are installed separately
# COPY package*.json ./

# Copy the rest of your application code to the working directory
COPY . .

# Install dependencies (will run every time you build the Docker image)
RUN npm install

# Expose the port the app runs on
EXPOSE 5050

# Start the application
CMD ["npm", "run", "dev"]
