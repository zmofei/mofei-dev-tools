'use client'
import { useEffect } from 'react';

interface HistoryItem {
  id: string;
  name: string;
  url: string;
  gistId?: string;
  timestamp: number;
  size: number;
}

export function useGeoJSONRedirect() {
  useEffect(() => {
    // 检查URL参数，如果有result参数就直接跳转
    const urlParams = new URLSearchParams(window.location.search);
    const resultParam = urlParams.get('result');
    
    if (resultParam) {
      try {
        const decodedResult = decodeURIComponent(resultParam);
        
        console.log('Checking for result parameter:', resultParam);
        console.log('Decoded result:', decodedResult);
        
        // 添加到历史记录
        const addToHistory = (url: string, gistPath?: string) => {
          try {
            const savedHistory = localStorage.getItem('geojson_history');
            const history = savedHistory ? JSON.parse(savedHistory) : [];
            
            // 尝试解析GeoJSON获取名称
            let name = 'GeoJSON Preview';
            let size = 0;
            
            if (decodedResult.startsWith('gist:')) {
              name = `Gist: ${gistPath || decodedResult.replace('gist:', '')}`;
              size = 0; // Gist文件大小未知
            } else {
              try {
                const geoJSON = JSON.parse(decodedResult);
                name = geoJSON.name || 
                       geoJSON.properties?.name || 
                       (geoJSON.features?.[0]?.properties?.name) || 
                       'GeoJSON Preview';
                size = new Blob([decodedResult]).size;
              } catch {
                name = 'GeoJSON Preview';
                size = new Blob([decodedResult]).size;
              }
            }
            
            const historyItem: HistoryItem = {
              id: Date.now().toString(),
              name: name,
              url: url,
              gistId: gistPath,
              timestamp: Date.now(),
              size: size
            };
            
            const newHistory = [historyItem, ...history].slice(0, 20);
            localStorage.setItem('geojson_history', JSON.stringify(newHistory));
          } catch (error) {
            console.error('Failed to add to history:', error);
          }
        };
        
        // 检查是否是gist格式
        if (decodedResult.startsWith('gist:')) {
          const gistId = decodedResult.replace('gist:', '');
          const targetUrl = `https://geojson.io/#id=gist:${gistId}`;
          console.log('Redirecting to gist:', targetUrl);
          
          // 添加到历史记录
          addToHistory(targetUrl, gistId);
          
          window.location.href = targetUrl;
        } else {
          // 普通URL格式 - decodedResult是JSON字符串，需要重新编码给geojson.io
          const reEncodedForGeojsonIo = encodeURIComponent(decodedResult);
          const targetUrl = `https://geojson.io/#data=data:application/json,${reEncodedForGeojsonIo}`;
          console.log('Redirecting to URL:', targetUrl);
          console.log('Original decoded result:', decodedResult);
          console.log('Re-encoded for geojson.io:', reEncodedForGeojsonIo);
          
          // 添加到历史记录
          addToHistory(targetUrl);
          
          window.location.href = targetUrl;
        }
        return;
      } catch (error) {
        console.error('Failed to redirect:', error);
        // 如果跳转失败，清除URL参数并继续正常流程
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);
}