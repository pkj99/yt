import yt_dlp
import json
from datetime import datetime

# 定義分類與對應的搜尋關鍵字
CATEGORIES = {
    '新聞': '台灣新聞直播',
    '電視劇':'24小時馬拉松 直播',
    '綜藝': '台灣綜藝 直播',
    '音樂': 'Lofi Hip Hop Live',
    '運動': 'Sports Live Stream',
    '即時影像': '台灣即時影像'
}

def getLiveData():
    all_results = {}
    ydl_opts = {
        'quiet': True,
        'extract_flat': False,
        'skip_download': True,
        'verbose': True,
        'live_status': 'is_live'
    }

    for cat, keyword in CATEGORIES.items():
        search_query = f"ytsearch5:{keyword}"

        print(f"正在掃描分類: {cat}...")
        candidates = []
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                info_dict = ydl.extract_info(search_query, download=False)
                if 'entries' not in info_dict: return []

                sorted_videos = sorted(info_dict['entries'], key=lambda x: x.get('view_count', 0), reverse=True)

                # for entry in info_dict['entries']:
                for entry in sorted_videos:
                    if not entry: continue

                    title = entry.get('title', '')

                    if cat == '新聞':
                        title = entry.get('uploader')
                    if cat == '電視劇':
                        if any(word in title.upper() for word in ['天才衝衝衝','飢餓遊戲','豬哥會社','萬秀豬王','綜藝大集合','新聞','NEWS','歌單','KKBOX','Radio']):
                            continue
                    if cat in ['綜藝','音樂','運動','即時影像']:
                        if any(word in title.upper() for word in ['新聞', 'NEWS']):
                            continue 

                    if entry.get('is_live'):
                        candidates.append({
                            "id": entry.get('id'),
                            "title": entry.get('title'),
                            "thumbnail": f"https://i.ytimg.com/vi/{entry.get('id')}/hqdefault.jpg",
                            "channel": entry.get('uploader')
                        })

                all_results[cat] = candidates
            except Exception as e:
                print(f"發生錯誤: {e}")
                
        
    # 封裝成最終格式
    final_output = {
        "update_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "channels": all_results
    }

    with open('js/live_channels.json', 'w', encoding='utf-8') as f:
        json.dump(final_output, f, ensure_ascii=False, indent=4)
    
    print("掃描完成，已產生 live_channels.json")

    return


if __name__ == "__main__":
    getLiveData()

