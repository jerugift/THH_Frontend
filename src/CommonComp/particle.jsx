import { useCallback } from "react";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim"; // if you are going to use `loadSlim`, install the "tsparticles-slim" package too.
const ParticleBg = () => {
  const particlesInit = useCallback(async (engine) => {
    console.log(engine);
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    await console.log(container);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        key: "plasma",
        name: "Plasma",
        background: {
          color: {
            value: "#fffff",
          },
        },
        particles: {
          number: {
            value: 150,
            density: {
              enable: true,
            },
          },
          color: {
            value: "#00000",
          },
          shape: {
            type: "circle",
          },
          opacity: {
            value: 1,
          },
          size: {
            value: 0,
          },
          links: {
            enable: true,
            distance: 200,
            color: "#19f",
            opacity: 0.1,
            width: 2,
          },
          move: {
            enable: true,
            speed: 1.5,
            outModes: "bounce",
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "repulse",
            },
          },
          modes: {
            repulse: {
              distance: 80,
              duration: 0.4,
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default ParticleBg;
