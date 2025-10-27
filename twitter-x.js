import prompts from 'prompts'
import cliProgress from 'cli-progress'
import fs from 'fs'
import os from 'os'
import path from 'path'
import ffmpegPath from 'ffmpeg-static'
import { spawn } from 'child_process'
import fetch from 'node-fetch'

const downloadsDir = path.join(os.homedir(), 'Downloads')
const bytesToMB = b => (b / 1024 / 1024).toFixed(1)
const sanitize = name => name.replace(/[<>:"/\\|?*]/g, '').slice(0, 100)

const getFileSize = async url => {
    try {
        const res = await fetch(url, { method: 'HEAD' })
        const len = res.headers.get('content-length')
        return len ? Number(len) : null
    } catch {
        return null
    }
}

const downloadWithBar = async (url, outPath, label) => {
    return new Promise(async (resolve, reject) => {
        const head = await fetch(url, { method: 'HEAD' })
        const total = parseInt(head.headers.get('content-length')) || 0
        const bar = new cliProgress.SingleBar({
            format: `${label} | {bar} {percentage}% | {value}/{total} MB | {speed} MB/s`
        }, cliProgress.Presets.shades_classic)

        const res = await fetch(url)
        const file = fs.createWriteStream(outPath)
        let downloaded = 0
        const start = Date.now()
        bar.start(total ? bytesToMB(total) : 0, 0, { speed: '0.0' })

        res.body.on('data', chunk => {
            downloaded += chunk.length
            const speed = bytesToMB(downloaded) / ((Date.now() - start) / 1000)
            bar.update(total ? bytesToMB(downloaded) : 0, { speed: speed.toFixed(2) })
        })

        res.body.pipe(file)
        res.body.on('end', () => { bar.stop(); resolve() })
        res.body.on('error', err => { bar.stop(); reject(err) })
    })
}

const main = async () => {
    const { url } = await prompts({
        type: 'text',
        name: 'url',
        message: 'Tweet linkini girin (örn: https://x.com/user/status/123...):'
    })

    if (!url.startsWith('http')) {
        console.error('❌ Geçersiz bağlantı!')
        process.exit(1)
    }

    console.log('🔍 Tweet bilgisi alınıyor...')

    const tweetId = url.match(/status\/(\d+)/)?.[1] || Date.now()
    const apiURL = `https://api.vxtwitter.com/${url.split('x.com/')[1] || url.split('twitter.com/')[1]}`
    const res = await fetch(apiURL)
    const data = await res.json()

    if (!data.media_extended?.length) {
        console.error('❌ Bu tweette video bulunamadı!')
        process.exit(1)
    }

    const videos = data.media_extended.filter(m => m.type === 'video')

    const enriched = await Promise.all(videos.map(async v => {
        const size = await getFileSize(v.url)
        const q = v.quality ||
            (v.height ? `${v.height}p` :
                (v.bitrate ? `${Math.round(v.bitrate / 1000)}kbps` : 'Bilinmiyor'))
        return { ...v, quality: q, size }
    }))

    const choices = enriched.map((v, i) => ({
        title: `${i + 1}. ${v.quality} (${v.size ? bytesToMB(v.size) + ' MB' : '? MB'})`,
        value: v
    }))

    const { selected } = await prompts({
        type: 'select',
        name: 'selected',
        message: 'İndirme kalitesini seçin:',
        choices
    })

    const { mode } = await prompts({
        type: 'select',
        name: 'mode',
        message: 'İndirme türü:',
        choices: [
            { title: '🎬 Sesli Video (MP4)', value: 'mp4' },
            { title: '🔇 Sessiz Video (MP4)', value: 'silent' },
            { title: '🎧 Sadece Ses (MP3)', value: 'mp3' }
        ]
    })

    const tmpFile = path.join(os.tmpdir(), `tw-${Date.now()}.mp4`)

    // file : TXJS-ID_QUALITY_TUR.mp4
    const qualityLabel = selected.quality?.replace(/\s/g, '') || 'Bilinmiyor'
    const typeLabel =
        mode === 'mp3' ? 'MP3' :
            mode === 'silent' ? 'Sessiz' : 'Sesli'

    const outName = `TXJS-${tweetId}_${qualityLabel}_${typeLabel}.${mode === 'mp3' ? 'mp3' : 'mp4'}`
    const outFile = path.join(downloadsDir, sanitize(outName))

    console.log(`\n⬇️  İndirme başlıyor...\n`)
    await downloadWithBar(selected.url, tmpFile, selected.quality)

    if (mode === 'silent') {
        console.log('\n🔇 Sessiz video oluşturuluyor...\n')
        const ff = spawn(ffmpegPath, ['-i', tmpFile, '-an', '-c:v', 'copy', '-y', outFile])
        ff.stderr.on('data', d => process.stdout.write(d.toString()))
        ff.on('close', code => {
            if (code === 0) {
                fs.unlinkSync(tmpFile)
                console.log(`\n✅ Tamamlandı → ${outFile}`)
            } else console.error('❌ FFmpeg başarısız oldu.')
        })
    } else if (mode === 'mp3') {
        console.log('\n🎵 MP3 çıkarılıyor...\n')
        const ff = spawn(ffmpegPath, ['-i', tmpFile, '-q:a', '0', '-map', 'a', '-y', outFile])
        ff.stderr.on('data', d => process.stdout.write(d.toString()))
        ff.on('close', code => {
            if (code === 0) {
                fs.unlinkSync(tmpFile)
                console.log(`\n✅ Tamamlandı → ${outFile}`)
            } else console.error('❌ FFmpeg başarısız oldu.')
        })
    } else {
        // mp4 with audio
        fs.copyFileSync(tmpFile, outFile)
        fs.unlinkSync(tmpFile)
        console.log(`\n✅ Tamamlandı → ${outFile}`)
    }
}

main()
