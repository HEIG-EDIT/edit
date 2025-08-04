import { DevDescription } from "../../components/landing_page/devDescription";

export const Emojis = () => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <DevDescription
        name="Alessio"
        imagePath="/landing_page/emojis/alessio.png"
        quote="TODO"
        role="Frontend"
      />
      <DevDescription
        name="Diana"
        imagePath="/landing_page/emojis/diana.png"
        quote="To keep calm when the compiler is not happy about my code, I like to see the world from the down facing dog."
        role="Backend"
      />
      <DevDescription
        name="Elbunita"
        imagePath="/landing_page/emojis/elbunita.png"
        quote="If you stare at Java Script long enough, the language stares back."
        role="Backend"
      />
      <DevDescription
        name="Saskya"
        imagePath="/landing_page/emojis/saskya.png"
        quote="The sun won't fix your code, but it will fix your focus."
        role="Frontend"
      />
    </div>
  );
};
