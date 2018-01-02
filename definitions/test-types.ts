import * as Tapable from "tapable"

const CarDisplays = { brakeLights: false, speedDisplay: 0, accelDisplay: 0 }

type SpeedChangeCtx = { deltaSpeed?: number, deltaTime?: number }

const hooks = {
    // first generic is the context (here, typeof Car)
    speedChange: new Tapable.AsyncSeriesHook<SpeedChangeCtx, number>(["newSpeed"]),
    accelerationChange: new Tapable.AsyncSeriesHook<any, number>(["newAcceleration"]),
    brakes: new Tapable.SyncHook<any, boolean>(["isBraking"]),
}

hooks.brakes.tap({ name: "BrakeLightPlugin" }, (isBraking) => {
    console.log("tapAsync brakes", { isBraking })
    CarDisplays.brakeLights = isBraking
})

const SpeedDisplayPluginData = { lastSpeed: 0, lastTime: 0 }
hooks.speedChange.tapAsync({ name: "SpeedDisplayPlugin", context: true }, (ctx, newSpeed, callback) => {
    const currentTime = Date.now()
    setTimeout(() => {
        console.log("tapAsync SpeedDisplay", { ctx, newSpeed })
        // add info to context
        ctx.deltaSpeed = newSpeed - SpeedDisplayPluginData.lastSpeed
        ctx.deltaTime = currentTime - SpeedDisplayPluginData.lastTime
        SpeedDisplayPluginData.lastSpeed = newSpeed
        SpeedDisplayPluginData.lastTime = currentTime
        CarDisplays.speedDisplay = newSpeed
        callback(null, "test return speed display")
    }, 100)
})
hooks.speedChange.tapAsync({ name: "AccelDisplayPlugin", context: true }, (ctx, newSpeed, callback) => {
    console.log("tapAsync AccelDisplayPlugin", { ctx, newSpeed })
    if (ctx.deltaSpeed != null && ctx.deltaTime != null) {
        const accel = ctx.deltaSpeed / ctx.deltaTime
        CarDisplays.accelDisplay = accel
        console.log(`Accel change (units/second): ${(accel * 1000).toFixed(2)}`)
    }
    callback(null, "test return accel")
})

hooks.brakes.call(true)

const testSpeeds: number[] = [21, 22, 22.5, 22.7, 23, 20, 17, 16, 11.3]

hooks.speedChange.tapAsync("TestSpeeds iteration", (err, result) => {
    setTimeout(() => {
        if (testSpeeds.length > 0) {
            hooks.speedChange.callAsync(testSpeeds.pop(), (err, result) => {
                // result is likely void...
                console.log("When is this called? On error only?")
                if (err) console.error(err)
            })
        }
    }, 120)
})

hooks.speedChange.callAsync(19, err => err && console.error(err))
