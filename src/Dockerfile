# Build Phase
FROM node:current-bullseye as builder
RUN apt-get update && apt-get install -y python sqlite3

WORKDIR /app
COPY ./gmg-app ./gmg-app
COPY ./gmg-client ./gmg-client
COPY ./gmg-server ./gmg-server
COPY ./build.sh .
RUN /bin/bash ./build.sh

# Run Phase
FROM node:current-bullseye-slim as runtime
RUN apt-get update && apt-get install -y sqlite3

COPY --from=builder /app/gmg-client /app/gmg-client
COPY --from=builder /app/gmg-server /app/gmg-server
WORKDIR /app/gmg-server
CMD ["npm", "run", "start:release"]
EXPOSE 80:80
