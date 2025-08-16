# Use the official AWS Lambda Node.js 18 base image for x86_64
FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:18

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --only=production

# Copy all JavaScript files (our handlers)
COPY *.js ./

# Copy any additional config files if needed
COPY *.json ./

# Set permissions
RUN chmod 755 ${LAMBDA_RUNTIME_DIR}

# Default command (will be overridden by each function)
CMD [ "index.handler" ]
