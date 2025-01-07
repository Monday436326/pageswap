import WormholeConnect, {
    WormholeConnectConfig, 
    WormholeConnectTheme
  } from '@wormhole-foundation/wormhole-connect';
  
  const config: WormholeConnectConfig = {
  };
  const theme: WormholeConnectTheme = {"mode":"dark"};
  
//   export default () => {
//     return <WormholeConnect config={config} theme={theme} />;
//   }

  export function WormholeWidget() {
    return (
      <div className="w-full max-w-xl mx-auto">
        <WormholeConnect 
          config={config}
          theme={theme}
        />
      </div>
    );
  }