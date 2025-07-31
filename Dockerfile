FROM node:22-slim
LABEL "language"="nodejs"
LABEL "framework"="next.js"
WORKDIR /src
COPY . .
RUN npm install -g pnpm && pnpm install
RUN pnpm run build
EXPOSE 8080
CMD pnpm run db:generate && pnpm run start