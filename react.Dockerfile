FROM node:20.17.0

RUN groupadd -r user && useradd -m -r -g user user

RUN apt-get update -y && apt-get install build-essential

COPY ./react /react

RUN chown -R user: /react

WORKDIR /react

RUN npm install

USER user

CMD ["npm", "start"]
