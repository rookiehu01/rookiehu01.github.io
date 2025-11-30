FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --only=production

COPY . .

ENV NODE_ENV=production
ENV PORT=8282

EXPOSE 8282

CMD ["npm", "start"]