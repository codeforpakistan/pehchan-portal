import Image from "next/image"
import { Button } from "@/components/ui/button"

interface PehchanButtonProps {
  onClick: () => void;
}

export default function PehchanButton({ onClick }: PehchanButtonProps) {
  return (
    <Button 
      className="w-full bg-[#00875A] hover:bg-[#006644] dark:bg-white dark:hover:bg-gray-100 text-white dark:text-[#00875A] font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors"
      onClick={onClick}
    >
      <Image
        src="/green_icon.svg"
        alt="Pehchan logo"
        width={24}
        height={24}
        className="mr-2"
      />
      Continue with Pehchan
    </Button>
  )
}