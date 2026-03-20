FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# create uploads folder
RUN mkdir -p uploads

EXPOSE 5000

CMD ["npm", "start"]