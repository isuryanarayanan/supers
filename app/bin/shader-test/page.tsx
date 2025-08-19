"use client";

import { useState } from "react";
import MatrixGridBackground from "@/components/ui/matrix-grid-background";
import WarpFbmBackground from "@/components/ui/warp-fbm-background";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ShaderTestPage() {
  const [enableWave, setEnableWave] = useState(true);
  const [enableMouseHover, setEnableMouseHover] = useState(true);
  const [enableCardBorder, setEnableCardBorder] = useState(true);
  const [selectedShader, setSelectedShader] = useState<"matrix" | "warp-fbm">("matrix");

  return (
    <>
      {/* Conditional Background Rendering */}
      {selectedShader === "matrix" && (
        <MatrixGridBackground
          enableWaveAnimation={enableWave}
          enableMouseHoverAnimation={enableMouseHover}
          enableCardBorderAnimation={enableCardBorder}
        />
      )}
      {selectedShader === "warp-fbm" && <WarpFbmBackground />}

      {/* Content */}
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Shader Animation Test</h1>
            <p className="text-muted-foreground">
              Test different shader backgrounds and animation controls
            </p>
          </div>

          {/* Shader Selection */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Shader Selection</CardTitle>
              <CardDescription>
                Choose which shader background to display
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Label htmlFor="shader-select">Background Shader:</Label>
                <Select value={selectedShader} onValueChange={(value: "matrix" | "warp-fbm") => setSelectedShader(value)}>
                  <SelectTrigger id="shader-select" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matrix">Matrix Grid</SelectItem>
                    <SelectItem value="warp-fbm">Warp fBM (Ocean/Electric)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Animation Controls - Only show for Matrix Grid */}
          {selectedShader === "matrix" && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Matrix Grid Animation Controls</CardTitle>
                <CardDescription>
                  Toggle different animation types to see the effects on the
                  background grid
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="wave-animation">Wave Animation</Label>
                    <p className="text-sm text-muted-foreground">
                      Animated bleeding borders flowing from top to bottom
                    </p>
                  </div>
                  <Switch
                    id="wave-animation"
                    checked={enableWave}
                    onCheckedChange={setEnableWave}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="mouse-hover">Mouse Hover Animation</Label>
                    <p className="text-sm text-muted-foreground">
                      Glow effects that follow your mouse cursor
                    </p>
                  </div>
                  <Switch
                    id="mouse-hover"
                    checked={enableMouseHover}
                    onCheckedChange={setEnableMouseHover}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="card-border">Card Border Animation</Label>
                    <p className="text-sm text-muted-foreground">
                      Special glow effects around hovered cards (hover the cards
                      below)
                    </p>
                  </div>
                  <Switch
                    id="card-border"
                    checked={enableCardBorder}
                    onCheckedChange={setEnableCardBorder}
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEnableWave(true);
                        setEnableMouseHover(true);
                        setEnableCardBorder(true);
                      }}
                    >
                      Enable All
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEnableWave(false);
                        setEnableMouseHover(false);
                        setEnableCardBorder(false);
                      }}
                    >
                      Disable All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warp fBM Shader Description */}
          {selectedShader === "warp-fbm" && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Warp fBM Shader</CardTitle>
                <CardDescription>
                  A fractal Brownian motion shader with domain warping and custom colormap
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This shader creates organic, flowing noise patterns using fractional Brownian motion (fBM) 
                  with domain warping. The noise is colored with a custom ocean-electric colormap that transitions 
                  from deep dark blue through bright yellow to pure white, creating dramatic, flowing patterns that 
                  evolve over time like electric currents or deep ocean waves.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Test Cards for Card Border Animation - Only show for Matrix Grid */}
          {selectedShader === "matrix" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Test Card 1</CardTitle>
                  <CardDescription>
                    Hover me to see card border effects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    This card should trigger special border glow effects when
                    hovered, but only if the Card Border Animation is enabled.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Test Card 2</CardTitle>
                  <CardDescription>Another test card</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Move your mouse around the page to see the mouse hover
                    animation effects on the background grid.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Test Card 3</CardTitle>
                  <CardDescription>Wave animation test</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    The wave animation creates flowing patterns from top to
                    bottom. Toggle it on and off to see the difference.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Content Cards for Warp fBM */}
          {selectedShader === "warp-fbm" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="backdrop-blur-sm bg-background/80">
                <CardHeader>
                  <CardTitle>Fractal Noise</CardTitle>
                  <CardDescription>Domain warping in action</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    The background shows fractal Brownian motion (fBM) noise with domain warping. 
                    This technique creates organic, flowing patterns by using the output of one 
                    noise function to warp the input coordinates of another.
                  </p>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-background/80">
                <CardHeader>
                  <CardTitle>Custom Colormap</CardTitle>
                  <CardDescription>Ocean depths to electric highlights</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    The shader uses a custom colormap that transitions from deep dark blue through bright yellow 
                    to pure white, creating an ocean-electric aesthetic. The enhanced contrast creates dramatic 
                    patterns that look like electric currents flowing through deep ocean waters.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Testing Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedShader === "matrix" && (
                <>
                  <div>
                    <h4 className="font-semibold">Wave Animation:</h4>
                    <p className="text-sm text-muted-foreground">
                      Look at the background grid. You should see subtle flowing
                      patterns moving from top to bottom when enabled.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Mouse Hover Animation:</h4>
                    <p className="text-sm text-muted-foreground">
                      Move your mouse around the page. You should see a glowing
                      effect around your cursor that affects nearby grid cells.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Card Border Animation:</h4>
                    <p className="text-sm text-muted-foreground">
                      Hover over the test cards above. You should see subtle glow
                      effects in the background grid around the card boundaries.
                    </p>
                  </div>
                </>
              )}
              {selectedShader === "warp-fbm" && (
                <>
                  <div>
                    <h4 className="font-semibold">Animated Noise:</h4>
                    <p className="text-sm text-muted-foreground">
                      The background shows continuously evolving noise patterns. 
                      The patterns flow and morph organically due to time-based animation.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Domain Warping:</h4>
                    <p className="text-sm text-muted-foreground">
                      Notice how the noise patterns curve and bend rather than appearing 
                      regular. This is domain warping - using noise to distort the 
                      coordinates of other noise functions.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Color Mapping:</h4>
                    <p className="text-sm text-muted-foreground">
                      The noise values are mapped to a custom ocean-electric color palette: dark blue → bright blue → 
                      yellow → white, creating dramatic electric or deep ocean visuals with smooth gradients.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
