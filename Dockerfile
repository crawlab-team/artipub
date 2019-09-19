FROM jelastic/nodejs:8.16.1-npm AS frontend

WORKDIR /app
ADD . /app
RUN npm install --registry=https://registry.npm.taobao.org

FROM jelastic/nodejs:8.16.1-npm

WORKDIR /app
ADD . /app
COPY --from=frontend /app/dist /frontend
RUN cp ./backend/package.json .
RUN npm install --registry=https://registry.npm.taobao.org

CMD npm run start:backend
