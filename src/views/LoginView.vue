<template>
  <div class="oc-login-shell min-h-screen bg-[#fff8f6]">
    <div class="grid min-h-screen lg:grid-cols-[0.45fr_0.55fr]">
      <section class="relative hidden overflow-hidden lg:flex">
        <div class="absolute inset-0 oc-login-hero" />
        <div class="absolute -left-24 top-16 h-72 w-72 rounded-full bg-white/35 blur-3xl" />
        <div class="absolute bottom-12 right-10 h-80 w-80 rounded-full bg-[#ffb89f]/35 blur-3xl" />
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_36%)]" />

        <div class="relative z-10 flex w-full flex-col justify-between px-12 py-10 xl:px-16 xl:py-12">
          <div>
            <h1 class="text-2xl font-semibold tracking-tight text-[#fff4ef] drop-shadow-[0_2px_10px_rgba(83,24,16,0.18)] xl:text-3xl">
              {{ branding.appName }}
            </h1>
            <p class="mt-2 whitespace-nowrap text-[13px] font-medium tracking-[0.04em] text-[#ffd9cf]/78">
              {{ branding.appNameEn }}
            </p>
          </div>

          <div class="relative mx-auto flex h-[520px] w-full max-w-[640px] items-end justify-center">
            <div class="relative h-[420px] w-[560px]">
              <div class="absolute bottom-0 left-8 right-8 h-12 rounded-full bg-[#7f2d1e]/20 blur-2xl" />

              <div
                ref="coralRef"
                class="absolute bottom-0 left-0 z-[3] transition-all duration-500 ease-out"
                :style="coralStyle"
              >
                <div class="absolute left-[72px] top-[82px] flex gap-10" :style="coralFaceStyle">
                  <div class="oc-pupil" :style="coralEyeStyle" />
                  <div class="oc-pupil" :style="coralEyeStyle" />
                </div>
              </div>

              <div
                ref="plumRef"
                class="absolute bottom-0 left-[118px] z-[2] transition-all duration-700 ease-out"
                :style="plumStyle"
              >
                <div class="absolute flex gap-8 transition-all duration-500 ease-out" :style="plumFaceStyle">
                  <div class="oc-eye" :class="{ 'oc-eye-blink': isPlumBlinking }">
                    <div v-if="!isPlumBlinking" class="oc-eye-core" :style="plumEyeStyle" />
                  </div>
                  <div class="oc-eye" :class="{ 'oc-eye-blink': isPlumBlinking }">
                    <div v-if="!isPlumBlinking" class="oc-eye-core" :style="plumEyeStyle" />
                  </div>
                </div>
              </div>

              <div
                ref="graphiteRef"
                class="absolute bottom-0 left-[270px] z-[4] transition-all duration-700 ease-out"
                :style="graphiteStyle"
              >
                <div class="absolute flex gap-5 transition-all duration-500 ease-out" :style="graphiteFaceStyle">
                  <div class="oc-eye oc-eye-small" :class="{ 'oc-eye-blink': isGraphiteBlinking }">
                    <div v-if="!isGraphiteBlinking" class="oc-eye-core oc-eye-core-small" :style="graphiteEyeStyle" />
                  </div>
                  <div class="oc-eye oc-eye-small" :class="{ 'oc-eye-blink': isGraphiteBlinking }">
                    <div v-if="!isGraphiteBlinking" class="oc-eye-core oc-eye-core-small" :style="graphiteEyeStyle" />
                  </div>
                </div>
              </div>

              <div
                ref="amberRef"
                class="absolute bottom-0 left-[344px] z-[5] transition-all duration-500 ease-out"
                :style="amberStyle"
              >
                <div class="absolute flex gap-6 transition-all duration-500 ease-out" :style="amberFaceStyle">
                  <div class="oc-pupil" :style="amberEyeStyle" />
                  <div class="oc-pupil" :style="amberEyeStyle" />
                </div>
                <div class="absolute h-[4px] w-20 rounded-full bg-[#3b241e]/80 transition-all duration-500 ease-out" :style="amberMouthStyle" />
              </div>
            </div>
          </div>

          <div />
        </div>
      </section>

      <section class="relative flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(231,76,60,0.08),transparent_34%)]" />
        <div class="relative z-10 w-full max-w-[422px]">
          <div class="mb-8 flex flex-col items-center text-center lg:hidden">
            <h2 class="text-[30px] font-semibold leading-[1.04] tracking-[-0.04em] text-[#171717]">
              欢迎登录
            </h2>
            <p class="mt-2 text-[15px] text-[#7b7b7b]">
              请输入您的账号和密码以进入系统
            </p>
          </div>

          <div>
            <div class="mb-10 hidden lg:block">
              <h2 class="text-[30px] font-semibold leading-[1.04] tracking-[-0.04em] text-[#171717]">
                欢迎登录
              </h2>
              <p class="mt-2 text-[15px] text-[#7b7b7b]">
                请输入您的账号和密码以进入系统
              </p>
            </div>

            <el-form :model="form" @submit.prevent="handleLogin">
              <div class="space-y-6">
                <div>
                  <label for="username" class="mb-1.5 block text-[14px] font-medium text-[#171717]">用户名</label>
                  <el-input
                    id="username"
                    v-model="form.username"
                    size="large"
                    placeholder="请输入用户名"
                    autocomplete="username"
                    :class="['oc-input', { 'oc-input-error': fieldErrors.username }]"
                    @focus="setActiveField('username')"
                    @blur="clearActiveField"
                    @input="handleUsernameInput"
                    @keyup.enter="handleLogin"
                  >
                    <template #prefix>
                      <Icon icon="mdi:account-outline" class="text-[16px] text-[#9b9b9b]" />
                    </template>
                  </el-input>
                  <p v-if="fieldErrors.username" class="oc-field-error">{{ fieldErrors.username }}</p>
                </div>

                <div>
                  <label for="password" class="mb-1.5 block text-[14px] font-medium text-[#171717]">密码</label>
                  <el-input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    size="large"
                    placeholder="请输入密码"
                    autocomplete="current-password"
                    :class="['oc-input', { 'oc-input-error': fieldErrors.password }]"
                    @focus="setActiveField('password')"
                    @blur="clearActiveField"
                    @input="handlePasswordInput"
                    @keyup.enter="handleLogin"
                  >
                    <template #prefix>
                      <Icon icon="mdi:lock-outline" class="text-[16px] text-[#9b9b9b]" />
                    </template>
                    <template #suffix>
                      <button
                        type="button"
                        class="flex items-center text-[#866862] transition-colors hover:text-[color:var(--oc-primary)]"
                        :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                        @click="togglePasswordVisibility"
                      >
                        <Icon :icon="showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" class="text-[18px]" />
                      </button>
                    </template>
                  </el-input>
                  <p v-if="fieldErrors.password" class="oc-field-error">{{ fieldErrors.password }}</p>
                </div>

                <div>
                  <label for="captcha" class="mb-1.5 block text-[14px] font-medium text-[#171717]">验证码</label>
                  <div class="oc-captcha-row">
                    <el-input
                      id="captcha"
                      v-model="form.captchaVerification"
                      size="large"
                      placeholder="请输入验证码"
                      autocomplete="off"
                      :class="['oc-input', 'oc-captcha-input', { 'oc-input-error': fieldErrors.captcha }]"
                      @focus="setActiveField('captcha')"
                      @blur="clearActiveField"
                      @input="handleCaptchaInput"
                      @keyup.enter="handleLogin"
                    >
                      <template #prefix>
                        <Icon icon="mdi:shield-key-outline" class="text-[16px] text-[#9b9b9b]" />
                      </template>
                    </el-input>

                    <button
                      type="button"
                      class="oc-captcha-preview"
                      :aria-label="'刷新验证码'"
                      :style="captchaDisplayStyle"
                      :disabled="captchaLoading"
                      @click="refreshCaptcha"
                    >
                      <span v-if="captchaLoading" class="oc-captcha-char">...</span>
                    </button>
                  </div>
                  <p v-if="fieldErrors.captcha" class="oc-field-error">{{ fieldErrors.captcha }}</p>
                </div>

                <el-button
                  type="primary"
                  size="large"
                  class="oc-btn-primary mt-3 w-full rounded-[12px] !text-[16px] !font-semibold"
                  :loading="loading"
                  @click="handleLogin"
                >
                  <span class="inline-flex items-center gap-2">
                    <span>{{ loading ? '正在登录...' : '进入工作区' }}</span>
                    <Icon v-if="!loading" icon="mdi:arrow-right" class="text-lg" />
                  </span>
                </el-button>
              </div>
            </el-form>
          </div>

        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties, Ref } from 'vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { captcha } from '@/apis/login.service'
import { branding } from '@/config/branding'
import { useUserStore } from '@/stores/user'
import { notifyMessage } from '@/utils/helper'

type FieldName = 'username' | 'password' | 'captcha' | null

const router = useRouter()
const userStore = useUserStore()

const form = ref({ username: '', password: '', captchaVerification: '', captchaToken: '' })
const fieldErrors = ref({ username: '', password: '', captcha: '' })
const loading = ref(false)
const showPassword = ref(false)
const activeField = ref<FieldName>(null)
const isLookingAtForm = ref(false)
const isPlumBlinking = ref(false)
const isGraphiteBlinking = ref(false)
const isPlumPeeking = ref(false)
const prefersReducedMotion = ref(false)

const plumRef = ref<HTMLElement | null>(null)
const graphiteRef = ref<HTMLElement | null>(null)
const amberRef = ref<HTMLElement | null>(null)
const coralRef = ref<HTMLElement | null>(null)

const mouseX = ref(0)
const mouseY = ref(0)
const captchaSeed = ref(0)
const captchaImage = ref('')
const captchaLoading = ref(false)

let lookTimeout = 0
let plumBlinkCleanup: (() => void) | null = null
let graphiteBlinkCleanup: (() => void) | null = null
let peekCleanup: (() => void) | null = null
let mediaQuery: MediaQueryList | null = null

const shouldNeutralizeCharacters = computed(() => false)

const isPasswordRevealScene = computed(() => {
  return showPassword.value && form.value.password.length > 0
})

const captchaDisplayStyle = computed<CSSProperties>(() => {
  if (!captchaImage.value) return {}

  return {
    backgroundImage: `url(${captchaImage.value})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }
})

type CaptchaPayload = {
  verificationCodeUrl?: string
  verificationCodeId?: string
  img?: string
  image?: string
  base64?: string
}

function normalizeCaptchaImage(value?: string) {
  if (!value) return ''
  if (value.startsWith('data:image')) return value
  return `data:image/png;base64,${value}`
}

async function refreshCaptcha() {
  if (captchaLoading.value) return

  captchaLoading.value = true
  try {
    const response = await captcha()
    const payload = ((response as { data?: CaptchaPayload })?.data ?? response) as CaptchaPayload

    captchaSeed.value += 1
    form.value.captchaToken = payload.verificationCodeId ?? ''
    captchaImage.value = normalizeCaptchaImage(
      payload.verificationCodeUrl ?? payload.img ?? payload.image ?? payload.base64,
    )

    if (!form.value.captchaToken || !captchaImage.value) {
      notifyMessage('验证码接口返回的数据格式无法识别', 'error')
    }
  } catch {
    captchaImage.value = ''
    form.value.captchaToken = ''
    notifyMessage('获取验证码失败，请稍后重试', 'error')
  } finally {
    captchaLoading.value = false
  }
}

function clearFieldError(field: keyof typeof fieldErrors.value) {
  fieldErrors.value[field] = ''
}

function handleUsernameInput(value: string) {
  form.value.username = value
  clearFieldError('username')
  handleTypingCue()
}

function handlePasswordInput(value: string) {
  form.value.password = value
  clearFieldError('password')
  handleTypingCue()
}

function handleCaptchaInput(value: string) {
  form.value.captchaVerification = value
  clearFieldError('captcha')
}

function normalizeText(value: string) {
  return value.trim()
}

function extractErrorMessage(error: unknown) {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const maybeError = error as { msg?: string; message?: string }
    return maybeError.msg || maybeError.message || ''
  }
  return ''
}

function applyServerFieldError(message: string) {
  if (!message) return

  if (/(验证码|captcha)/i.test(message)) {
    fieldErrors.value.captcha = message
    return
  }

  if (/(用户名|账号|user(name)?)/i.test(message)) {
    fieldErrors.value.username = message
  }

  if (/(密码|password)/i.test(message)) {
    fieldErrors.value.password = message
  }
}

function validateLoginForm() {
  const username = normalizeText(form.value.username)
  const password = form.value.password
  const captchaVerification = normalizeText(form.value.captchaVerification)
  const nextErrors = { username: '', password: '', captcha: '' }

  if (!username) nextErrors.username = '请输入用户名'
  if (!password) nextErrors.password = '请输入密码'
  if (!captchaVerification) nextErrors.captcha = '请输入验证码'
  if (!form.value.captchaToken) nextErrors.captcha = nextErrors.captcha || '验证码已失效，请刷新后重试'

  fieldErrors.value = nextErrors

  const firstError = nextErrors.username || nextErrors.password || nextErrors.captcha
  if (firstError) {
    notifyMessage(firstError, 'error')
    return null
  }

  form.value.username = username
  form.value.captchaVerification = captchaVerification

  return {
    username,
    password,
    captchaVerification,
    captchaToken: form.value.captchaToken,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function setMousePosition(event: MouseEvent) {
  mouseX.value = event.clientX
  mouseY.value = event.clientY
}

function setMotionPreference(event?: MediaQueryListEvent) {
  const next = event ? event.matches : Boolean(mediaQuery?.matches)
  prefersReducedMotion.value = next

  if (next) {
    isPlumBlinking.value = false
    isGraphiteBlinking.value = false
    isPlumPeeking.value = false
  }
}

function calculatePose(elRef: Ref<HTMLElement | null>, options: {
  faceRangeX: number
  faceRangeY: number
  skewRange: number
  divisorX: number
  divisorY: number
}) {
  if (!elRef.value || prefersReducedMotion.value || shouldNeutralizeCharacters.value) {
    return { faceX: 0, faceY: 0, bodySkew: 0 }
  }

  const rect = elRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 3
  const deltaX = mouseX.value - centerX
  const deltaY = mouseY.value - centerY

  return {
    faceX: clamp(deltaX / options.divisorX, -options.faceRangeX, options.faceRangeX),
    faceY: clamp(deltaY / options.divisorY, -options.faceRangeY, options.faceRangeY),
    bodySkew: clamp(-deltaX / 130, -options.skewRange, options.skewRange),
  }
}

function calculateEyeOffset(elRef: Ref<HTMLElement | null>, maxDistance: number, forced?: { x: number; y: number } | null) {
  if (forced) return forced
  if (!elRef.value || prefersReducedMotion.value || shouldNeutralizeCharacters.value) {
    return { x: 0, y: 0 }
  }

  const rect = elRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 5
  const deltaX = mouseX.value - centerX
  const deltaY = mouseY.value - centerY
  const angle = Math.atan2(deltaY, deltaX)
  const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance)

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  }
}

function queueLookAtForm() {
  window.clearTimeout(lookTimeout)
  isLookingAtForm.value = true
  lookTimeout = window.setTimeout(() => {
    isLookingAtForm.value = false
  }, 900)
}

function handleTypingCue() {
  if (activeField.value === 'username') {
    queueLookAtForm()
  }
}

function setActiveField(field: Exclude<FieldName, null>) {
  activeField.value = field
  queueLookAtForm()
}

function clearActiveField() {
  activeField.value = null
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

function scheduleBlink(target: Ref<boolean>) {
  let blinkTimer = 0
  let resetTimer = 0

  const stop = () => {
    window.clearTimeout(blinkTimer)
    window.clearTimeout(resetTimer)
    target.value = false
  }

  const loop = () => {
    if (prefersReducedMotion.value) {
      target.value = false
      return
    }

    blinkTimer = window.setTimeout(() => {
      target.value = true
      resetTimer = window.setTimeout(() => {
        target.value = false
        loop()
      }, 160)
    }, 2800 + Math.random() * 3200)
  }

  loop()
  return stop
}

function restartPeekLoop() {
  if (peekCleanup) {
    peekCleanup()
    peekCleanup = null
  }

  if (prefersReducedMotion.value || isPasswordRevealScene.value || !showPassword.value || !form.value.password) {
    isPlumPeeking.value = false
    return
  }

  let peekTimer = 0
  let resetTimer = 0

  const stop = () => {
    window.clearTimeout(peekTimer)
    window.clearTimeout(resetTimer)
    isPlumPeeking.value = false
  }

  const loop = () => {
    peekTimer = window.setTimeout(() => {
      isPlumPeeking.value = true
      resetTimer = window.setTimeout(() => {
        isPlumPeeking.value = false
        loop()
      }, 750)
    }, 2200 + Math.random() * 2200)
  }

  loop()
  peekCleanup = stop
}

function getForcedLook(name: 'plum' | 'graphite' | 'amber' | 'coral') {
  if (shouldNeutralizeCharacters.value) return { x: 0, y: 0 }

  if (isPasswordRevealScene.value) {
    if (name === 'plum') return { x: -2, y: -2 }
    if (name === 'graphite') return { x: -2, y: -1 }
    if (name === 'amber') return { x: -1, y: 0 }
    return { x: -1, y: 0 }
  }

  if (showPassword.value && form.value.password && name === 'plum' && isPlumPeeking.value) {
    return { x: 8, y: 2 }
  }

  if (
    isLookingAtForm.value ||
    activeField.value === 'username' ||
    (activeField.value === 'password' && !showPassword.value)
  ) {
    if (name === 'plum') return { x: 5, y: 1 }
    if (name === 'graphite') return { x: 4, y: -2 }
    if (name === 'amber') return { x: 3, y: 0 }
    return { x: 2, y: 0 }
  }

  return null
}

const plumPose = computed(() => calculatePose(plumRef, {
  faceRangeX: 16,
  faceRangeY: 12,
  skewRange: 7,
  divisorX: 20,
  divisorY: 32,
}))

const graphitePose = computed(() => calculatePose(graphiteRef, {
  faceRangeX: 10,
  faceRangeY: 8,
  skewRange: 6,
  divisorX: 22,
  divisorY: 34,
}))

const amberPose = computed(() => calculatePose(amberRef, {
  faceRangeX: 12,
  faceRangeY: 10,
  skewRange: 5,
  divisorX: 24,
  divisorY: 34,
}))

const coralPose = computed(() => calculatePose(coralRef, {
  faceRangeX: 12,
  faceRangeY: 8,
  skewRange: 4,
  divisorX: 26,
  divisorY: 34,
}))

const plumEyeStyle = computed<CSSProperties>(() => {
  const offset = calculateEyeOffset(plumRef, 5, getForcedLook('plum'))
  return {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
  }
})

const graphiteEyeStyle = computed<CSSProperties>(() => {
  const offset = calculateEyeOffset(graphiteRef, 4, getForcedLook('graphite'))
  return {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
  }
})

const amberEyeStyle = computed<CSSProperties>(() => {
  const offset = calculateEyeOffset(amberRef, 4.5, getForcedLook('amber'))
  return {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
  }
})

const coralEyeStyle = computed<CSSProperties>(() => {
  const offset = calculateEyeOffset(coralRef, 4.5, getForcedLook('coral'))
  return {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
  }
})

const plumStyle = computed<CSSProperties>(() => ({
  width: '194px',
  height: activeField.value ? '412px' : '384px',
  borderRadius: '22px 22px 0 0',
  background: 'linear-gradient(180deg, #ff866d 0%, #ef5b46 60%, #cc412f 100%)',
  transform: isPasswordRevealScene.value
    ? 'skewX(-3deg) translateX(14px)'
    : `skewX(${plumPose.value.bodySkew - (activeField.value ? 2 : 0)}deg) translateX(${activeField.value ? 8 : 0}px)`,
  transformOrigin: 'bottom center',
  boxShadow: '0 28px 70px rgba(121, 36, 23, 0.22)',
}))

const plumFaceStyle = computed<CSSProperties>(() => {
  if (isPasswordRevealScene.value) {
    return {
      left: '58px',
      top: '58px',
    }
  }

  return {
    left: `${48 + plumPose.value.faceX}px`,
    top: `${52 + plumPose.value.faceY}px`,
  }
})

const graphiteStyle = computed<CSSProperties>(() => ({
  width: '132px',
  height: activeField.value === 'password' && !showPassword.value ? '304px' : '322px',
  borderRadius: '16px 16px 0 0',
  background: 'linear-gradient(180deg, #453734 0%, #2d2320 100%)',
  transform: isPasswordRevealScene.value
    ? 'skewX(-2deg) translateX(0px)'
    : `skewX(${graphitePose.value.bodySkew + (isLookingAtForm.value ? 4 : 0)}deg) translateX(${isLookingAtForm.value ? 8 : 0}px)`,
  transformOrigin: 'bottom center',
  boxShadow: '0 24px 60px rgba(24, 14, 12, 0.22)',
}))

const graphiteFaceStyle = computed<CSSProperties>(() => {
  if (isPasswordRevealScene.value) {
    return {
      left: '18px',
      top: '28px',
    }
  }

  return {
    left: `${26 + graphitePose.value.faceX}px`,
    top: `${34 + graphitePose.value.faceY}px`,
  }
})

const amberStyle = computed<CSSProperties>(() => ({
  width: '154px',
  height: '236px',
  borderRadius: '78px 78px 0 0',
  background: 'linear-gradient(180deg, #ffd98d 0%, #f4c361 100%)',
  transform: isPasswordRevealScene.value ? 'skewX(-3deg) translateX(2px)' : `skewX(${amberPose.value.bodySkew}deg)`,
  transformOrigin: 'bottom center',
  boxShadow: '0 22px 48px rgba(148, 95, 21, 0.18)',
}))

const amberFaceStyle = computed<CSSProperties>(() => {
  if (isPasswordRevealScene.value) {
    return {
      left: '28px',
      top: '42px',
    }
  }

  return {
    left: `${40 + amberPose.value.faceX}px`,
    top: `${38 + amberPose.value.faceY}px`,
  }
})

const amberMouthStyle = computed<CSSProperties>(() => {
  if (isPasswordRevealScene.value) {
    return {
      left: '22px',
      top: '94px',
    }
  }

  return {
    left: `${34 + amberPose.value.faceX}px`,
    top: `${92 + amberPose.value.faceY}px`,
  }
})

const coralStyle = computed<CSSProperties>(() => ({
  width: '246px',
  height: '208px',
  borderRadius: '130px 130px 0 0',
  background: 'linear-gradient(180deg, #f7c0a8 0%, #ee9a73 100%)',
  transform: isPasswordRevealScene.value ? 'skewX(0deg) translateX(8px)' : `skewX(${coralPose.value.bodySkew}deg)`,
  transformOrigin: 'bottom center',
  boxShadow: '0 20px 40px rgba(171, 87, 56, 0.16)',
}))

const coralFaceStyle = computed<CSSProperties>(() => {
  if (isPasswordRevealScene.value) {
    return {
      left: '56px',
      top: '78px',
      transform: 'translate(0px, 0px)',
    }
  }

  return {
    transform: `translate(${coralPose.value.faceX}px, ${coralPose.value.faceY}px)`,
  }
})

async function handleLogin() {
  if (loading.value) return

  const payload = validateLoginForm()
  if (!payload) return

  loading.value = true
  try {
    await userStore.login(payload)
    await router.push('/chat')
  } catch (error) {
    const errorMessage = extractErrorMessage(error)
    applyServerFieldError(errorMessage)
    form.value.captchaVerification = ''
    await refreshCaptcha()
  } finally {
    loading.value = false
  }
}

watch(
  () => [showPassword.value, form.value.password, prefersReducedMotion.value] as const,
  () => {
    restartPeekLoop()
  },
  { immediate: true },
)

watch(
  prefersReducedMotion,
  (value) => {
    if (plumBlinkCleanup) plumBlinkCleanup()
    if (graphiteBlinkCleanup) graphiteBlinkCleanup()

    if (!value) {
      plumBlinkCleanup = scheduleBlink(isPlumBlinking)
      graphiteBlinkCleanup = scheduleBlink(isGraphiteBlinking)
    }
  },
  { immediate: true },
)

onMounted(() => {
  void refreshCaptcha()
  window.addEventListener('mousemove', setMousePosition)

  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  setMotionPreference()

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', setMotionPreference)
  } else {
    mediaQuery.addListener(setMotionPreference)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', setMousePosition)
  window.clearTimeout(lookTimeout)

  if (plumBlinkCleanup) plumBlinkCleanup()
  if (graphiteBlinkCleanup) graphiteBlinkCleanup()
  if (peekCleanup) peekCleanup()

  if (mediaQuery) {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', setMotionPreference)
    } else {
      mediaQuery.removeListener(setMotionPreference)
    }
  }
})
</script>

<style scoped>
.oc-login-hero {
  background:
    linear-gradient(180deg, rgba(116, 29, 17, 0.1), rgba(116, 29, 17, 0)),
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.24), transparent 28%),
    linear-gradient(135deg, #a63122 0%, #cf4835 48%, #ef6a53 100%);
}

.oc-eye {
  display: flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  background: #fff7f4;
  transition: height 150ms ease, transform 150ms ease;
}

.oc-eye-small {
  width: 16px;
  height: 16px;
}

.oc-eye-blink {
  height: 3px !important;
}

.oc-eye-core {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #2d2320;
  transition: transform 100ms ease-out;
}

.oc-eye-core-small {
  width: 6px;
  height: 6px;
}

.oc-pupil {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #362523;
  transition: transform 100ms ease-out;
}

.oc-captcha-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 104px;
  gap: 0;
  align-items: stretch;
}

.oc-captcha-preview {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  overflow: hidden;
  border: 1px solid #e7e7e7;
  border-left: 0;
  border-radius: 0 6px 6px 0;
  background: transparent;
  cursor: pointer;
}

.oc-captcha-preview::before,
.oc-captcha-preview::after {
  content: none;
}

.oc-captcha-char {
  position: relative;
  z-index: 1;
  display: inline-block;
  font-size: 18px;
  font-weight: 700;
  font-style: italic;
  line-height: 1;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.35);
}

.oc-field-error {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: #d93025;
}

:deep(.oc-input .el-input__wrapper) {
  min-height: 46px;
  border: 1px solid #e7e7e7;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: none;
  transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

:deep(.oc-input .el-input__wrapper:hover) {
  border-color: #d8d8d8;
}

:deep(.oc-captcha-input .el-input__wrapper) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

:deep(.oc-input .el-input__wrapper.is-focus) {
  border-color: #cfcfcf;
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.04);
  background: #ffffff;
}

:deep(.oc-input-error .el-input__wrapper) {
  border-color: #d93025;
}

:deep(.oc-input-error .el-input__wrapper:hover),
:deep(.oc-input-error .el-input__wrapper.is-focus) {
  border-color: #d93025;
  box-shadow: 0 0 0 4px rgba(217, 48, 37, 0.08);
}

:deep(.oc-input .el-input__inner) {
  color: #171717;
  font-size: 15px;
}

:deep(.oc-input .el-input__inner::placeholder) {
  color: #8f8f8f;
}

:deep(.el-checkbox__label) {
  color: #171717;
  font-size: 14px;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  border-color: #171717;
  background-color: #171717;
}

:deep(.el-checkbox__inner:hover) {
  border-color: #171717;
}

:deep(.el-checkbox__inner) {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border-color: #171717;
}

.oc-btn-primary {
  height: 46px !important;
  background: #1b1b1b !important;
  border: none !important;
  box-shadow: none;
}

.oc-btn-primary:hover {
  background: #111111 !important;
}

@media (prefers-reduced-motion: reduce) {
  .oc-eye,
  .oc-eye-core,
  .oc-pupil,
  :deep(.oc-input .el-input__wrapper) {
    transition: none !important;
  }
}
</style>
