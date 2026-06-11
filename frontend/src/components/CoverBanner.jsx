export default function CoverBanner({ 
  imageUrl = "https://i.pinimg.com/originals/50/0d/05/500d05bcbc3c80383458ee245122acb8.gif", 
  // imageUrl = "https://i.pinimg.com/736x/68/f2/aa/68f2aa0d9922f9db69c00b2a3813caea.jpg", 
  altText = "Profile cover banner" 
}) {
  return (
    <div className="w-full overflow-hidden rounded-t-[2rem] bg-slate-100 dark:bg-slate-800">
      <img
        src={imageUrl}
        alt={altText}
        className="w-full h-40 object-cover object-center block"
      />
    </div>
  );
}
