FROM node:20-bookworm-slim as base
RUN groupadd -r appuser && \
	useradd --create-home --gid appuser --home-dir /app --no-log-init --system appuser

FROM base AS build
WORKDIR /app
USER appuser
COPY --chown=appuser:appuser . .
RUN npm install && \
	npm run build

FROM base AS run
ARG COMMIT="(not set)"
ARG LASTMOD="(not set)"
ENV COMMIT=$COMMIT
ENV LASTMOD=$LASTMOD
WORKDIR /app
USER appuser
COPY --chown=appuser:appuser . .
COPY --chown=appuser:appuser --from=build /app/dist /app/dist
RUN yarn install --production
EXPOSE 4000
ENV PORT 4000
CMD ["npm", "start"]

