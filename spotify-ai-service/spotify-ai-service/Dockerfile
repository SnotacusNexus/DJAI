# Use an official Node.js runtime as the base image
FROM node:14

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install Python dependencies
RUN pip3 install requests

# Expose the port the app runs on
EXPOSE 22222

# Define the command to run the app
CMD [ "node", "app.js" ]
