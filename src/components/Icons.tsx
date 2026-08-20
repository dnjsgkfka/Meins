export function IconHome({ active }: { active?: boolean }) {
  const color = active ? '#000000' : '#cecece';
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <mask id="icon-home-mask" fill="white">
        <path d="M20.9961 8.3418V22H1V8.3418L10.998 0L20.9961 8.3418Z"/>
      </mask>
      <path
        d="M20.9961 8.3418H22.4961V7.63978L21.9571 7.19004L20.9961 8.3418ZM20.9961 22V23.5H22.4961V22H20.9961ZM1 22H-0.5V23.5H1V22ZM1 8.3418L0.0390375 7.19004L-0.5 7.63978V8.3418H1ZM10.998 0L11.959 -1.15176L10.998 -1.95353L10.0371 -1.15176L10.998 0ZM20.9961 8.3418H19.4961V22H20.9961H22.4961V8.3418H20.9961ZM20.9961 22V20.5H1V22V23.5H20.9961V22ZM1 22H2.5V8.3418H1H-0.5V22H1ZM1 8.3418L1.96096 9.49356L11.959 1.15176L10.998 0L10.0371 -1.15176L0.0390375 7.19004L1 8.3418ZM10.998 0L10.0371 1.15176L20.0351 9.49356L20.9961 8.3418L21.9571 7.19004L11.959 -1.15176L10.998 0Z"
        fill={color}
        mask="url(#icon-home-mask)"
      />
    </svg>
  );
}

export function IconOwnership({ active }: { active?: boolean }) {
  const color = active ? '#000000' : '#cecece';
  return (
    <svg width="20" height="25" viewBox="0 0 20 25" fill="none" aria-hidden="true">
      <path
        d="M0.75 22.4988V1.59883L3 3.24883L5.25 1.04883L7.5 3.24883L9.75 1.04883L12 3.24883L14.25 1.04883L16.5 3.24883L18.75 1.59883V23.0488L16.5 20.8488L14.25 23.0488L12 20.8488L9.75 23.0488L7.5 20.8488L5.25 23.0488L3 20.8488L0.75 22.4988Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M4.125 6.67383H12M4.125 10.0488H12M4.125 13.4238H8.625"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function IconChat({ active }: { active?: boolean }) {
  const color = active ? '#000000' : '#cecece';
  return (
    <svg width="21" height="22" viewBox="0 0 21 22" fill="none" aria-hidden="true">
      <path
        d="M20.25 3.97852V16.9463H6.90723L6.6875 17.166L3.375 20.4854V16.9463H0.75V3.97852H20.25Z"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function IconArrowRight() {
  return (
    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden="true">
      <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
