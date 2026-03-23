import { Composition } from "remotion";
import { Fill3DIntro } from "./Fill3DIntro";
import { ProductShowcase } from "./ProductShowcase";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Fill3DIntro"
        component={Fill3DIntro}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ProductShowcase"
        component={ProductShowcase}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: "Fill-3D Print Service",
          subtitle: "Professional 3D Printing",
        }}
      />
    </>
  );
};
