Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "http://localhost:3000",
            "http://127.0.0.1:3000",
            /\Ahttps?:\/\/(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?::\d+)?\z/,
            "http://yourwebsite.production.app",
            /\Ahttps:\/\/deploy-preview-\d{1,4}--yourwebsite\.domain\.app\z/

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      max_age: 86400
  end
end
