import { Settings } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { ThreeDVariant, AnimationLibrary } from '../App';

interface ThreeDSelectorProps {
  threeDVariant: ThreeDVariant;
  setThreeDVariant: (variant: ThreeDVariant) => void;
  animationLibrary: AnimationLibrary;
  setAnimationLibrary: (library: AnimationLibrary) => void;
}

export function ThreeDSelector({
  threeDVariant,
  setThreeDVariant,
  animationLibrary,
  setAnimationLibrary,
}: ThreeDSelectorProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-sm"
          >
            <Settings className="h-4 w-4 text-white/70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 bg-black/90 border-white/10 backdrop-blur-md"
          align="end"
        >
          <DropdownMenuLabel className="text-white/70 text-xs">
            3D Element
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={threeDVariant}
            onValueChange={(value) => setThreeDVariant(value as ThreeDVariant)}
          >
            <DropdownMenuRadioItem
              value="scales"
              className="text-white/90 focus:bg-white/10 focus:text-white"
            >
              Scales of Justice
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="pillar"
              className="text-white/90 focus:bg-white/10 focus:text-white"
            >
              Legal Pillar
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator className="bg-white/10" />

          <DropdownMenuLabel className="text-white/70 text-xs">
            Animation Library
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={animationLibrary}
            onValueChange={(value) => setAnimationLibrary(value as AnimationLibrary)}
          >
            <DropdownMenuRadioItem
              value="framer"
              className="text-white/90 focus:bg-white/10 focus:text-white"
            >
              Framer Motion
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="gsap"
              className="text-white/90 focus:bg-white/10 focus:text-white"
            >
              GSAP
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
