# Serves the static Storybook build (storybook-static/) on Cloud Run.
# Build context: the repo root, after `npm run build-storybook`.
FROM nginx:1.27.3-alpine
COPY deploy/storybook/nginx.conf /etc/nginx/conf.d/default.conf
COPY storybook-static /usr/share/nginx/html
EXPOSE 8080
