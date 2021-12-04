FROM node:16.13.0

RUN apt-get update -qq && apt-get install -y build-essential cmake git libudev-dev python3

RUN mkdir /var/app

WORKDIR /var/app

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .

CMD ["yarn", "start"]
