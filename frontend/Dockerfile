# Use an official Node.js LTS image with Alpine
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies with clean install and address legacy peer deps
RUN npm ci --legacy-peer-deps

# Add missing Babel plugin explicitly
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object

# Update browserslist database
RUN npx update-browserslist-db@latest

# Copy the rest of the application code
COPY . .

# Build the application for production (if using static serving)
# RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
