/* eslint-disable max-len */
// Copyright 2017-2023 @polkadot/app-society authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Adapted (with permission) from https://www.w3schools.com/code/tryit.asp?filename=GGIGKE2GG7N1

import type { AccountId } from '@polkadot/types/interfaces'

export const PADD = 50
export const SIZE = 300

function canary(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: number,
  f: (ctx: CanvasRenderingContext2D, path: Path2D) => void
): void {
  const path = new Path2D(
    'M373.1,126.9c-5.2-4.1-11.4-9.7-22.7-11.1c-10.6-1.4-21.4,5.7-28.7,10.4c-7.3,4.7-21.1,18.5-26.8,22.7 c-5.7,4.2-20.3,8.1-43.8,22.2s-115.7,73.3-115.7,73.3l24,0.3L52.4,299.8h10.7l-15.4,11.7c0,0,13.6,3.6,25-3.6l0,3.3 c0,0,127.4-50.2,152-37.2l-15,4.4c1.3,0,25.5,1.6,25.5,1.6s0.8,15.1,15.4,24.8c14.6,9.6,14.9,14.9,14.9,14.9s-7.6,3.1-7.6,7 c0,0,11.2-3.4,21.6-3.1c10.4,0.3,19.5,3.1,19.5,3.1s-0.8-4.2-10.9-7c-10.2-2.9-20.1-13.8-25-19.8c-4.9-6-8.3-16.7-4.1-27.4 c3.5-9.1,15.7-14.1,40.9-27.1c29.7-15.4,36.5-26.8,40.7-35.7c4.2-8.9,10.4-26.6,13.9-34.9c4.4-10.7,9.8-16.4,14.3-19.8 c4.4-3.4,24.5-10.9,24.5-10.9S378,130.8,373.1,126.9z'
  )

  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.scale(s / 440, s / 440)
  ctx.translate(-220, -220)
  f(ctx, path)
  ctx.restore()
}

function typography(ctx: CanvasRenderingContext2D, w: number, h: number, s: number): void {
  const path1 = new Path2D(
    'M631.44,140.4v-.59a21.61,21.61,0,0,0-21.57-21.32H595.54a2,2,0,0,1-2.29-2.29v-13c0-.19,0-.39,0-.6a24.82,24.82,0,1,0-49.63,0V116.2a2,2,0,0,1-2.29,2.29H495a2,2,0,0,1-2.29-2.29V101.31a23.55,23.55,0,0,0-47.1,0V116.2c0,1.53-.68,2.29-2,2.29H429a21.62,21.62,0,0,0,0,43.23,8.51,8.51,0,0,1,1.08.05h13.46c1.35,0,2,.76,2,2.29v20a23.56,23.56,0,0,0,47.1.93v-20.9a2,2,0,0,1,2.29-2.29h46.33a2,2,0,0,1,2.29,2.29V174.5q0,19.6-3.31,31.94a48.46,48.46,0,0,1-12,21.39q-8.65,9-22.79,13.87a167.15,167.15,0,0,1-29.24,6.59,22.13,22.13,0,0,0,4.63,43.78c.53,0,1.05,0,1.57-.05q58.08-7.63,83.89-34.15,26.85-27.62,26.85-83.37V164a2,2,0,0,1,2.29-2.29h14.3A21.61,21.61,0,0,0,631.44,140.4Z'
  )
  const path2 = new Path2D(
    'M839,94.82a13.92,13.92,0,0,0-10.18-4.33H655.55a22.28,22.28,0,0,0,0,44.55H787a1.49,1.49,0,0,1,1.27.76c.34.51.34.94,0,1.27q-18.84,32.85-62.37,57.54-1.79,1.27-3.31-.77c-2.84-3.84-5.34-7.22-7.53-10.16h0a25.27,25.27,0,0,0-34-6.28l-1,.65A25.24,25.24,0,0,0,673.92,213q24.24,33.34,46,65.05a25.45,25.45,0,0,0,41.69-29c-2.21-3.24-4.76-6.93-7.66-11.13-.85-1.18-.59-2.12.77-2.8q31.31-18.33,51-39a169.23,169.23,0,0,0,32-47.6,68.81,68.81,0,0,0,5.6-28V105A14,14,0,0,0,839,94.82Z'
  )
  const path3 = new Path2D(
    'M393.36,104.87a14,14,0,0,0-10.31-4.2H294.6s-7.68.28-7.72-.24A23.2,23.2,0,0,0,241.32,96a.67.67,0,0,1-.08.17,194.56,194.56,0,0,1-36.3,73,23.08,23.08,0,0,0,4.15,30.59l.37.32a23.09,23.09,0,0,0,30.7-1.36A222.9,222.9,0,0,0,274.6,146a3,3,0,0,1,3.06-2h65.17c1.69,0,2.37.68,2,2q-5.61,49.65-31.44,72.56-23.9,21.18-74,29.3h0a22.15,22.15,0,0,0,3.19,44.06,23.06,23.06,0,0,0,3.23-.23,6,6,0,0,1,1-.07Q322.78,281.17,358.61,242q37.68-41.25,38.95-126.78A14,14,0,0,0,393.36,104.87Z'
  )
  const path4 = new Path2D(
    'M492.24,21.51a10.75,10.75,0,0,0-5.72-2.8c-2.68-.35-5.39,1.43-7.23,2.62S474,26,472.52,27s-5.12,2-11,5.59-29.17,18.46-29.17,18.46l6.05.06L411.42,65.08h2.69l-3.87,3a8.67,8.67,0,0,0,6.3-.92l0,.83s32.09-12.65,38.32-9.37L451.1,59.7c.33,0,6.44.39,6.44.39a8.61,8.61,0,0,0,3.88,6.24c3.68,2.43,3.74,3.75,3.74,3.75s-1.9.78-1.9,1.77a17.4,17.4,0,0,1,10.38,0s-.2-1-2.76-1.77-5.06-3.49-6.31-5a7,7,0,0,1-1-6.9c.88-2.28,4-3.55,10.31-6.83,7.49-3.87,9.19-6.77,10.24-9s2.63-6.7,3.5-8.8a11.6,11.6,0,0,1,3.6-5,46.77,46.77,0,0,1,6.18-2.76S493.49,22.5,492.24,21.51Z'
  )

  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.scale(s / 440, s / 440)
  ctx.translate(-220, -220)
  ctx.fill(path1)
  ctx.fill(path2)
  ctx.fill(path3)
  ctx.fill(path4)
  ctx.restore()
}

function addressToBits(publicKey: Uint8Array): boolean[] {
  return publicKey.reduce((bits: boolean[], byte): boolean[] => {
    for (let j = 0; j < 8; ++j) {
      bits.push((byte & (1 << (7 - j))) !== 0)
    }

    return bits
  }, [])
}

function ring(
  ctx: CanvasRenderingContext2D,
  r: number,
  bits: boolean[],
  f: (ctx: CanvasRenderingContext2D, on: boolean) => void
): void {
  ctx.save()
  ctx.translate(0.5, 0.5)

  for (let i = 0; i < bits.length; i++) {
    ctx.save()
    ctx.rotate(((Math.PI * 2) / bits.length) * i)
    ctx.translate(0, -r)
    f(ctx, bits[i])
    ctx.restore()
  }

  ctx.restore()
}

function splitRows(bits: boolean[], rows: number[]) {
  let i = 0

  // eslint-disable-next-line no-return-assign
  return rows.map((r) => bits.slice(i, (i += r)))
}

function tattoo(ctx: CanvasRenderingContext2D, bits: boolean[]): void {
  const rows = splitRows(bits, [71, 61, 51, 41, 32])

  for (let i = 0; i < rows.length; ++i) {
    ring(ctx, 0.5 - (31 / 500) * (i + 0.5), rows[i], (ctx, on) => {
      if (on) {
        ctx.beginPath()
        ctx.arc(0, 0, 8 / 500, 0, 2 * Math.PI)
        ctx.fillStyle = 'black'
        ctx.fill()
      }
    })
  }

  ctx.lineWidth = 10
  canary(ctx, 1, 1, 200 / 500, (ctx, path) => ctx.stroke(path))
}

function tattooSpiro(ctx: CanvasRenderingContext2D, bits: boolean[]): void {
  const cycles = 8
  const limit = 0.75
  const dot = 8 / 500

  ctx.save()
  ctx.translate(0.5 - dot, 0.5 + dot)
  ctx.fillStyle = 'black'

  let radius = 0.5 - dot

  for (let i = 0, count = bits.length; i < count; i++) {
    radius -= ((0.5 / count) * limit) / (radius * 4)
    ctx.rotate((((Math.PI * 2) / count) * cycles) / (radius * 4))
    ctx.save()
    ctx.translate(0, -radius)
    ctx.beginPath()
    ctx.arc(0, 0, bits[i] ? dot : dot / 2, 0, 2 * Math.PI)
    ctx.fillStyle = bits[i] ? 'black' : '#e6007a'
    ctx.fill()
    ctx.restore()
  }

  ctx.restore()
  ctx.lineWidth = 10
  canary(ctx, 1 - dot, 1 + dot, 220 / 500, (ctx, path) => ctx.stroke(path))
}

function tattooPink(ctx: CanvasRenderingContext2D, bits: boolean[]): void {
  const rows = splitRows(bits, [71, 61, 51, 41, 32])

  for (let i = 0; i < rows.length; ++i) {
    ring(ctx, 0.5 - (31 / 500) * (i + 0.5), rows[i], (ctx, on) => {
      ctx.beginPath()
      ctx.arc(0, 0, (on ? 8 : 4) / 500, 0, 2 * Math.PI)
      ctx.fillStyle = on ? 'black' : '#e6007a'
      ctx.fill()
    })
  }

  canary(ctx, 1, 1, 220 / 500, (ctx, path) => ctx.fill(path))
}

function tattoo2(ctx: CanvasRenderingContext2D, bits: boolean[]): void {
  const rows = splitRows(bits, [64, 64, 64, 64])

  for (let i = 0; i < rows.length; ++i) {
    ring(ctx, 0.5 - (36 / 500) * (i + 0.5), rows[i], (ctx, on) => {
      if (on) {
        ctx.beginPath()
        ctx.moveTo(0, -18 / 500)
        ctx.lineTo(0, 18 / 500)
        ctx.lineWidth = 0.01
        ctx.stroke()
      }
    })
  }

  canary(ctx, 1, 1, 220 / 500, (ctx, path) => ctx.fill(path))
}

function tattoo2b(ctx: CanvasRenderingContext2D, bits: boolean[]): void {
  const rows = splitRows(bits, [128, 128])

  for (let i = 0; i < rows.length; ++i) {
    ring(ctx, 0.5 - (36 / 500) * (i + 0.5), rows[i], (ctx, on) => {
      if (on) {
        ctx.beginPath()
        ctx.moveTo(0, -18 / 500)
        ctx.lineTo(0, 18 / 500)
        ctx.lineWidth = 0.01
        ctx.stroke()
      }
    })
  }

  ctx.lineWidth = 6
  canary(ctx, 1, 1, 350 / 500, (ctx, path) => ctx.stroke(path))
}

function tattooIndex(ctx: CanvasRenderingContext2D, index: string): void {
  ctx.save()
  ctx.translate(SIZE / 2 + 35, (SIZE + PADD) * 2 + SIZE / 2)
  ctx.rotate(330 * (Math.PI / 180))

  ctx.font = '20px Helvetica'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'

  ctx.fillText(index, 0, 0)
  ctx.restore()

  ctx.lineWidth = 6
  ctx.save()
  ctx.translate(0, (SIZE + PADD) * 2)
  ctx.scale(SIZE, SIZE)
  canary(ctx, 1, 1, 500 / 500, (ctx, path) => ctx.stroke(path))
  ctx.restore()
}

function tattooJapaneseIndex(ctx: CanvasRenderingContext2D, index: string): void {
  ctx.save()
  ctx.translate(SIZE + PADD + SIZE / 2, (SIZE + PADD) * 2 + SIZE / 2 + 70)

  ctx.font = '20px Helvetica'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'

  ctx.fillText(index, 0, 0)
  ctx.restore()

  ctx.save()
  ctx.translate(SIZE / 2 + PADD + 10, (SIZE + PADD) * 2)
  ctx.scale(SIZE, SIZE)
  typography(ctx, 1, 1, 340 / 500)
  ctx.restore()
}

function tattooIndexFilled(ctx: CanvasRenderingContext2D, index: string): void {
  ctx.save()
  ctx.translate((SIZE + PADD) * 2 + SIZE / 2, (SIZE + PADD) * 2 + SIZE - 70)

  ctx.font = '20px Helvetica'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'

  ctx.fillText(index, 0, 0)
  ctx.restore()

  ctx.lineWidth = 6
  ctx.save()
  ctx.translate((SIZE + PADD) * 2, (SIZE + PADD) * 2)
  ctx.scale(SIZE, SIZE)
  canary(ctx, 1, 1, 350 / 500, (ctx, path) => ctx.fill(path))
  ctx.restore()
}
function tattoo3(ctx: CanvasRenderingContext2D, bits: boolean[]): void {
  ctx.lineWidth = 0.01

  for (let i = 0; i < 8; ++i) {
    for (let j = 0; j < 32; ++j) {
      if (bits[i * 32 + j]) {
        ctx.save()
        ctx.translate((j + 0.5) / 32, i / 8)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, 1 / 8)
        ctx.stroke()
        ctx.restore()
      }
    }
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  canary(ctx, 1, 1, 1, (ctx, path) => ctx.fill(path))
  ctx.lineWidth = 6
  canary(ctx, 1, 1, 1, (ctx, path) => ctx.stroke(path))
}

export function draw(ctx: CanvasRenderingContext2D, accountId: AccountId, accountIndex: string): void {
  console.log(`Generating ink for ${accountId.toString()} as ${accountId.toHex()}`)

  const bits = addressToBits(accountId.toU8a())

  ctx.save()
  ctx.translate(0, 0)
  ctx.scale(SIZE, SIZE)
  tattoo(ctx, bits)
  ctx.restore()

  ctx.save()
  ctx.translate(SIZE + PADD, 0)
  ctx.scale(SIZE, SIZE)
  tattooPink(ctx, bits)
  ctx.restore()

  ctx.save()
  ctx.translate(0, SIZE + PADD)
  ctx.scale(SIZE, SIZE)
  tattoo2(ctx, bits)
  ctx.restore()

  ctx.save()
  ctx.translate(SIZE + PADD, SIZE + PADD)
  ctx.scale(SIZE, SIZE)
  tattoo3(ctx, bits)
  ctx.restore()

  ctx.save()
  ctx.translate((SIZE + PADD) * 2, 0)
  ctx.scale(SIZE, SIZE)
  tattooSpiro(ctx, bits)
  ctx.restore()

  ctx.save()
  ctx.translate((SIZE + PADD) * 2, SIZE + PADD)
  ctx.scale(SIZE, SIZE)
  tattoo2b(ctx, bits)
  ctx.restore()

  if (accountIndex) {
    tattooIndex(ctx, accountIndex)
    tattooJapaneseIndex(ctx, accountIndex)
    tattooIndexFilled(ctx, accountIndex)
  }
}
