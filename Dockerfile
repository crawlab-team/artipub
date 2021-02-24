FROM jelastic/nodejs:15.9.0-npm AS frontend

WORKDIR /app
ADD . /app
RUN npm install
RUN npm run build

FROM jelastic/nodejs:15.9.0-npm
RUN yum install -y nginx && yum clean all
COPY --from=frontend /app/dist /frontend
WORKDIR /app
ADD . /app
RUN cp ./backend/package.json . && \
  cp /app/nginx/artipub.conf /etc/nginx/conf.d/artipub.conf
RUN npm install

EXPOSE 3000 8000
CMD /app/docker_init.sh

