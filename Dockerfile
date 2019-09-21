FROM jelastic/nodejs:8.16.1-npm AS frontend

WORKDIR /app
ADD . /app
RUN npm install
RUN npm run build

FROM jelastic/nodejs:8.16.1-npm

WORKDIR /app
ADD . /app
COPY --from=frontend /app/dist /frontend
RUN cp ./backend/package.json .
RUN npm install
RUN yum install -y nginx
RUN cp /app/nginx/artipub.conf /etc/nginx/conf.d

CMD /app/docker_init.sh
