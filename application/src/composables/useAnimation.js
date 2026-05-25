import { ref, onUnmounted } from 'vue'
import { easeInOutCubic } from '../utils/helpers.js'

export function useAnimation() {
  const animationFrames = ref([])
  const isAnimating = ref(false)

  function cancelAllAnimations() {
    animationFrames.value.forEach(frameId => {
      if (frameId) {
        cancelAnimationFrame(frameId)
      }
    })
    animationFrames.value = []
    isAnimating.value = false
  }

  function animateProperty(options) {
    return new Promise(resolve => {
      const {
        startValue,
        endValue,
        duration = 500,
        easing = easeInOutCubic,
        onUpdate,
        onComplete
      } = options

      const startTime = performance.now()
      let frameId = null

      isAnimating.value = true

      function animate(currentTime) {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easing(progress)
        const currentValue = startValue + (endValue - startValue) * easedProgress

        if (onUpdate) {
          onUpdate(currentValue, progress)
        }

        if (progress < 1) {
          frameId = requestAnimationFrame(animate)
        } else {
          if (onComplete) {
            onComplete(endValue)
          }
          isAnimating.value = false
          resolve(endValue)
        }
      }

      frameId = requestAnimationFrame(animate)
      animationFrames.value.push(frameId)
    })
  }

  function animateSequence(animations, delayBetween = 0) {
    return new Promise(resolve => {
      async function runSequence() {
        for (let i = 0; i < animations.length; i++) {
          if (i > 0 && delayBetween > 0) {
            await new Promise(res => setTimeout(res, delayBetween))
          }
          await animateProperty(animations[i])
        }
        resolve()
      }
      runSequence()
    })
  }

  onUnmounted(() => {
    cancelAllAnimations()
  })

  return {
    animationFrames,
    isAnimating,
    animateProperty,
    animateSequence,
    cancelAllAnimations
  }
}

export function useCardAnimation() {
  const cardRotations = ref([])
  const flippedCards = ref([])
  const { animationFrames, animateProperty, cancelAllAnimations } = useAnimation()

  function animateCardFlip(index, duration = 500) {
    return new Promise(resolve => {
      const startRotation = cardRotations.value[index] || 0
      const endRotation = 180

      animateProperty({
        startValue: startRotation,
        endValue: endRotation,
        duration,
        onUpdate: value => {
          cardRotations.value[index] = value
        },
        onComplete: () => {
          cardRotations.value[index] = endRotation
          if (!flippedCards.value.includes(index)) {
            flippedCards.value.push(index)
          }
          resolve()
        }
      })
    })
  }

  async function flipCards(count, delayBetween = 300) {
    cardRotations.value = new Array(count).fill(0)
    flippedCards.value = []

    for (let i = 0; i < count; i++) {
      if (i > 0) {
        await new Promise(res => setTimeout(res, delayBetween))
      }
      await animateCardFlip(i)
    }
  }

  function resetCardAnimation() {
    cancelAllAnimations()
    cardRotations.value = []
    flippedCards.value = []
  }

  return {
    cardRotations,
    flippedCards,
    animationFrames,
    animateCardFlip,
    flipCards,
    resetCardAnimation,
    cancelAllAnimations
  }
}
