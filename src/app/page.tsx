'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import yaml from 'js-yaml';

import 'swagger-ui-react/swagger-ui.css';

// SwaggerUIをクライアントサイドでのみロードするために動的インポート
const SwaggerUI = dynamic(() => import('swagger-ui-react').then((mod) => mod.default), {
  ssr: false,
});

export default function SwaggerPage() {
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchYamlSpec = async () => {
      try {
        // publicディレクトリ内のYAMLファイルを取得
        const response = await fetch('/openapi.yaml');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch YAML: ${response.status} ${response.statusText}`);
        }
        
        const yamlText = await response.text();
        
        // YAMLをJSONに変換
        const parsedSpec = yaml.load(yamlText) as Record<string, unknown>;
        setSpec(parsedSpec);
      } catch (err) {
        console.error('Error loading Swagger spec:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchYamlSpec();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 ">
      <h1 className="text-2xl font-bold mb-6">API Documentation</h1>
      
      {isLoading && <p>Loading API documentation...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error loading API spec:</strong> {error}</p>
          <p className="text-sm mt-2">Make sure the YAML file is placed in the public directory.</p>
        </div>
      )}
      
      {!isLoading && !error && spec && (
        <SwaggerUI spec={spec} supportedSubmitMethods={[]} />
      )}
    </div>
  );
}