FROM node:10.18.0-alpine as build
WORKDIR /build
COPY package.json /build/
RUN npm install

FROM microsoft/azure-cli:latest as final
RUN apk add nodejs
RUN az extension add -n azure-devops
RUN rm -rf /root/.azure-devops/python-sdk/cache
WORKDIR /app
COPY --from=build /build/node_modules /app/node_modules
COPY scripts.js /app/
COPY tools /app/tools
COPY fiscal-de-pr.js /app/
COPY start.sh /app/
CMD ["/bin/bash", "start.sh"]
