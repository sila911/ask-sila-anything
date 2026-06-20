import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";
import { cn } from "../../lib/utils";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.75, 0.95] : [0.9, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 0.45], [35, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.45], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 0.45], [0, -50]);

  return (
    <div
      className="h-[36rem] md:h-[42rem] flex items-center justify-center relative p-2 md:p-4 w-full"
      ref={containerRef}
    >
      <div
        className="py-4 md:py-8 w-full relative"
        style={{
          perspective: "800px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="max-w-5xl mx-auto text-center mb-6"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
      }}
      className="max-w-3xl -mt-6 mx-auto h-[28rem] md:h-[32rem] w-full border border-white/10 bg-white/5 backdrop-blur-md rounded-3xl p-2 md:p-4"
    >
      <div className="h-full w-full overflow-y-auto rounded-2xl p-2 md:p-4 bg-slate-900/10 dark:bg-black/20 custom-scrollbar">
        {children}
      </div>
    </motion.div>
  );
};
