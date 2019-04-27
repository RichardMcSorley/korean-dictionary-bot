FROM node:10-alpine
ENV NODE_ENV=production
EXPOSE 8080

RUN npm i npm@latest -g && \
    apk upgrade -U && \
    apk add ca-certificates ffmpeg libva-intel-driver && \
    rm -rf /var/cache/*

RUN mkdir -p /opt/node_app/app/.next && chown node:node /opt/node_app

WORKDIR /opt/node_app

COPY package.json package-lock.json* ./
RUN npm install --no-optional && npm cache clean --force
ENV PATH /opt/node_app/node_modules/.bin:$PATH
COPY . .
RUN npm run build
CMD [ "npm", "start" ]