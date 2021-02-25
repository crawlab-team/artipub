FROM jelastic/nodejs:15.9.0-npm AS frontend

WORKDIR /app
ADD ./frontend /app
RUN npm install
RUN npm run build

FROM jelastic/nodejs:15.9.0-npm
RUN yum install -y nginx && yum clean all
COPY --from=frontend /app/dist /frontend
WORKDIR /app
ADD ./backend ./docker_init.sh ./nginx /app/
RUN cp /app/artipub.conf /etc/nginx/conf.d/artipub.conf
RUN npm install

EXPOSE 3000 8000
CMD /app/docker_init.sh

